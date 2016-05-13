import json
import hashlib
import logging
import os
import uuid
import io
import requests
import zipfile
import itertools
import pandas as pd

from django.db import models
from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.urlresolvers import reverse
from django.contrib.sites.models import Site
from django.contrib.postgres.fields import JSONField
from django.utils.timezone import now
from django.template.loader import render_to_string

from utils.models import ReadOnlyFileSystemStorage, get_random_filename

from .import tasks

from .workflow.matrix import BedMatrix
from .workflow.matrixByMatrix import MatrixByMatrix
from .workflow import validation


logger = logging.getLogger(__name__)

encode_store = ReadOnlyFileSystemStorage.create_store(settings.ENCODE_PATH)
userdata_store = ReadOnlyFileSystemStorage.create_store(settings.USERDATA_PATH)


class Dataset(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        related_name='%(class)s',)
    borrowers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='%(class)s_borrowers',
    )
    name = models.CharField(
        max_length=128)
    description = models.TextField(
        blank=True)
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False)
    public = models.BooleanField(
        default=False)
    validated = models.BooleanField(
        default=False)
    validation_notes = models.TextField(
        blank=True)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    def get_form_cancel_url(self):
        if self.id:
            return self.get_absolute_url()
        else:
            return reverse('analysis:manage_data')


HG19 = 1
MM9 = 2
GENOME_ASSEMBLY_CHOICES = (
    (HG19, 'hg19'),
    (MM9,  'mm9'),
)


def get_chromosome_size_file(genome_assembly):
    if genome_assembly == HG19:
        return validation.get_chromosome_size_path('hg19')
    elif genome_assembly == MM9:
        return validation.get_chromosome_size_path('mm9')


class DatasetDownload(models.Model):
    NOT_STARTED = 0
    STARTED = 1
    FINISHED_ERROR = 2
    FINISHED_SUCCESS = 3
    STATUS_CHOICES = (
        (NOT_STARTED, 'not-started'),
        (STARTED, 'started'),
        (FINISHED_ERROR, 'finished with errors'),
        (FINISHED_SUCCESS, 'successfully completed'),
    )
    CHUNK = 1024 * 1024

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        related_name='%(class)s',)
    url = models.URLField()
    data = models.FileField(
        blank=True,
        max_length=256,
        storage=userdata_store)
    filesize = models.FloatField(
        null=True)
    md5 = models.CharField(
        max_length=64,
        null=True)
    status_code = models.PositiveSmallIntegerField(
        default=NOT_STARTED,
        choices=STATUS_CHOICES)
    status = models.TextField(
        blank=True,
        null=True)
    start_time = models.DateTimeField(
        blank=True,
        null=True)
    end_time = models.DateTimeField(
        blank=True,
        null=True)

    def get_retry_url(self, parent):
        return reverse('analysis:dataset_download_retry',
                       args=[parent.id, self.id])

    @property
    def basename(self):
        return os.path.basename(self.data.path)

    def set_filename(self):
        basename, ext = os.path.splitext(os.path.basename(self.url))
        path = self.owner.path
        fn = os.path.join(path, "{}{}".format(basename, ext))
        i = 1
        while os.path.exists(fn):
            fn = os.path.join(path, "{}-{}{}".format(basename, i, ext))
            i += 1

        logger.info('Setting filename to {}'.format(fn))

        # set filename to object
        self.data.name = fn[len(settings.USERDATA_PATH)+1:]

        # write a temporary file prevent-overwriting file
        with open(fn, 'w') as f:
            f.write('temporary')

    def save(self, *args, **kwargs):
        if not self.data.name:
            self.set_filename()
        super().save(*args, **kwargs)

    @staticmethod
    def check_valid_url(url):
        # ensure URL is valid and doesn't raise a 400/500 error
        resp = requests.head(url)
        return resp.ok, "{}: {}".format(resp.status_code, resp.reason)

    def show_download_retry(self):
        return self.status_code == self.FINISHED_ERROR

    def download(self):
        fn = self.data.path
        self.reset()
        try:
            r = requests.get(self.url, stream=True)
            with open(fn, 'wb') as f:
                for chunk in r.iter_content(chunk_size=self.CHUNK):
                    if chunk:  # filter out keep-alive new chunks
                        f.write(chunk)
            self.end_time = now()
            self.status_code = self.FINISHED_SUCCESS
            self.md5 = self.get_md5()
            self.filesize = os.path.getsize(fn)
        except Exception as e:
            self.start_time = None
            self.status_code = self.FINISHED_ERROR
            self.status = str(e)
        self.save()
        for ds in self.related_datasets():
            ds.validate_and_save()

    def get_md5(self):
        # equivalent to "md5 -q $FN"
        fn = self.data.path
        hasher = hashlib.md5()
        with open(fn, "rb") as f:
            for block in iter(lambda: f.read(self.CHUNK), b''):
                hasher.update(block)
        return hasher.hexdigest()

    def reset(self):
        self.status_code = self.STARTED
        self.status = ''
        self.start_time = now()
        self.end_time = None
        self.filesize = None
        self.md5 = ''

    def delete_file(self):
        if self.data and os.path.exists(self.data.path):
            logger.info('Deleting {}'.format(self.data.path))
            os.remove(self.data.path)

    def related_datasets(self):
        return itertools.chain(
            self.plus.all(),
            self.minus.all(),
            self.ambiguous.all(),
        )


class GenomicDataset(Dataset):
    genome_assembly = models.PositiveSmallIntegerField(
        db_index=True,
        choices=GENOME_ASSEMBLY_CHOICES)

    @property
    def subclass(self):
        # this is inherited model; get subclass
        if hasattr(self, 'encodedataset'):
            return self.encodedataset
        else:
            return self.userdataset

    @property
    def is_stranded(self):
        raise NotImplementedError('Abstract method')


class UserDataset(GenomicDataset):
    DATA_TYPES = (
        ('Cage',        'Cage'),
        ('ChiaPet',     'ChiaPet'),
        ('ChipSeq',     'ChipSeq'),
        ('DnaseDgf',    'DnaseDgf'),
        ('DnaseSeq',    'DnaseSeq'),
        ('FaireSeq',    'FaireSeq'),
        ('Mapability',  'Mapability'),
        ('Nucleosome',  'Nucleosome'),
        ('Orchid',      'Orchid'),
        ('RepliChip',   'RepliChip'),
        ('RepliSeq',    'RepliSeq'),
        ('RipSeq',      'RipSeq'),
        ('RnaPet',      'RnaPet'),
        ('RnaSeq',      'RnaSeq'),
        ('SmartSeq',    'SmartSeq'),
        ('Other',       'Other (describe in "description" field)'),
    )

    data_type = models.CharField(
        max_length=16,
        choices=DATA_TYPES)
    ambiguous = models.ForeignKey(
        DatasetDownload,
        null=True,
        related_name='ambiguous')
    plus = models.ForeignKey(
        DatasetDownload,
        null=True,
        related_name='plus')
    minus = models.ForeignKey(
        DatasetDownload,
        null=True,
        related_name='minus')
    url = models.URLField(
        max_length=256,
        null=True)
    expiration_date = models.DateTimeField(
        null=True)

    @property
    def is_stranded(self):
        return self.plus is not None

    @property
    def is_downloaded(self):
        success_code = DatasetDownload.FINISHED_SUCCESS
        if self.is_stranded:
            return self.plus.status_code == success_code and \
                   self.minus.status_code == success_code
        else:
            return self.ambiguous.status_code == success_code

    @classmethod
    def usable(cls, user):
        # must be owned by user and validated
        return cls.objects.filter(owner=user, validated=True)

    def get_absolute_url(self):
        return reverse('analysis:user_dataset', args=[self.pk, ])

    def get_update_url(self):
        return reverse('analysis:user_dataset_update', args=[self.pk, ])

    def get_delete_url(self):
        return reverse('analysis:user_dataset_delete', args=[self.pk, ])

    def validate_and_save(self):
        # wait until all files are downloaded before attempting validation
        if not self.is_downloaded:
            return

        size_file = get_chromosome_size_file(self.genome_assembly)
        if self.is_stranded:
            validatorA = validation.BigWigValidator(
                self.plus.data.path, size_file)
            validatorA.validate()

            validatorB = validation.BigWigValidator(
                self.minus.data.path, size_file)
            validatorB.validate()

            is_valid = validatorA.is_valid and validatorB.is_valid
            notes = '\n'.join([
                validatorA.display_errors(),
                validatorB.display_errors()
            ]).strip()

        else:
            validator = validation.BigWigValidator(
                self.ambiguous.data.path, size_file)
            validator.validate()

            is_valid = validator.is_valid
            notes = validator.display_errors()

        # intentionally omit post_save signal
        self.__class__.objects\
            .filter(id=self.id)\
            .update(
                validated=is_valid,
                validation_notes=notes)


class EncodeDataset(GenomicDataset):
    data_ambiguous = models.FileField(
        blank=True,
        max_length=256,
        storage=encode_store)
    data_plus = models.FileField(
        blank=True,
        max_length=256,
        storage=encode_store)
    data_minus = models.FileField(
        blank=True,
        max_length=256,
        storage=encode_store)
    data_type = models.CharField(
        max_length=16,
        db_index=True)
    cell_type = models.CharField(
        max_length=32,
        db_index=True)
    antibody = models.CharField(
        max_length=32,
        blank=True,
        db_index=True)
    rna_extract = models.CharField(
        max_length=32,
        blank=True,
        db_index=True)
    treatment = models.CharField(
        max_length=32,
        blank=True,
        db_index=True)
    phase = models.CharField(
        max_length=32,
        blank=True,
        db_index=True)
    localization = models.CharField(
        max_length=32,
        blank=True,
        db_index=True)
    extra_content = JSONField(default=dict)

    @property
    def is_stranded(self):
        return self.data_ambiguous.name == ''

    @classmethod
    def get_field_options(cls):
        dicts = {}
        fields = [
            'data_type',
            'cell_type',
            'antibody',
            'rna_extract',
            'treatment',
            'phase',
            'localization',
        ]
        for genome, _ in GENOME_ASSEMBLY_CHOICES:
            dicts[genome] = {}
            for fld in fields:
                dicts[genome][fld] = cls.objects\
                    .filter(genome_assembly=genome)\
                    .values_list(fld, flat=True)\
                    .distinct()\
                    .order_by(fld)
        return dicts


class FeatureList(Dataset):
    genome_assembly = models.PositiveSmallIntegerField(
        choices=GENOME_ASSEMBLY_CHOICES)
    stranded = models.BooleanField(
        default=True)
    dataset = models.FileField(
        blank=True,
        max_length=256)

    @classmethod
    def usable(cls, user):
        # must be owned by user and validated
        return cls.objects.filter(owner=user, validated=True)

    @classmethod
    def usable_json(cls, user):
        return json.dumps(list(
            cls.usable(user)
               .values('id', 'name', 'genome_assembly')
        ))

    def get_absolute_url(self):
        return reverse('analysis:feature_list', args=[self.pk, ])

    def get_update_url(self):
        return reverse('analysis:feature_list_update', args=[self.pk, ])

    def get_delete_url(self):
        return reverse('analysis:feature_list_delete', args=[self.pk, ])

    def validate_and_save(self):
        size_file = self.get_chromosome_size_file(self.genome_assembly)
        validator = validation.FeatureListValidator(
            self.dataset.path, size_file)
        validator.validate()

        # intentionally omit post_save signal
        self.__class__.objects\
            .filter(id=self.id)\
            .update(
                validated=validator.is_valid,
                validation_notes=validator.display_errors())


class SortVector(Dataset):
    feature_list = models.ForeignKey(
        FeatureList)
    vector = models.FileField(
        max_length=256)

    @classmethod
    def usable(cls, user):
        # must be owned by user and validated
        return cls.objects.filter(owner=user, validated=True)

    @classmethod
    def usable_json(cls, user):
        return json.dumps(list(
            cls.usable(user)
               .values('id', 'name', 'feature_list_id')
        ))

    def get_absolute_url(self):
        return reverse('analysis:sort_vector', args=[self.pk, ])

    def get_update_url(self):
        return reverse('analysis:sort_vector_update', args=[self.pk, ])

    def get_delete_url(self):
        return reverse('analysis:sort_vector_delete', args=[self.pk, ])

    def validate_and_save(self):
        validator = validation.SortVectorValidator(
            self.feature_list.dataset.path,
            self.vector.path)
        validator.validate()

        # intentionally omit post_save signal
        self.__class__.objects\
            .filter(id=self.id)\
            .update(
                validated=validator.is_valid,
                validation_notes=validator.display_errors())


class AnalysisDatasets(models.Model):
    analysis = models.ForeignKey(
        'Analysis')
    dataset = models.ForeignKey(
        'GenomicDataset')
    display_name = models.CharField(
        max_length=128)
    count_matrix = models.ForeignKey(
        'FeatureListCountMatrix',
        null=True)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        verbose_name_plural = 'Analysis datasets'


ANCHOR_START = 0
ANCHOR_CENTER = 1
ANCHOR_END = 2
ANCHOR_CHOICES = (
    (ANCHOR_START, 'start'),
    (ANCHOR_CENTER, 'center'),
    (ANCHOR_END, 'end'),
)


class GenomicBinSettings(models.Model):
    anchor = models.PositiveSmallIntegerField(
        choices=ANCHOR_CHOICES,
        default=ANCHOR_CENTER)
    bin_start = models.IntegerField(
        default=-2500)
    bin_number = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(50), MaxValueValidator(250)])
    bin_size = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(1)])

    class Meta:
        abstract = True


class Analysis(GenomicBinSettings):
    UPLOAD_TO = 'analysis/'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL)
    name = models.CharField(
        max_length=128)
    description = models.TextField(
        blank=True)
    datasets = models.ManyToManyField(
        GenomicDataset,
        through=AnalysisDatasets,
        through_fields=('analysis', 'dataset'))
    genome_assembly = models.PositiveSmallIntegerField(
        choices=GENOME_ASSEMBLY_CHOICES)
    feature_list = models.ForeignKey(
        FeatureList)
    sort_vector = models.ForeignKey(
        SortVector,
        blank=True,
        null=True)
    validated = models.BooleanField(
        default=False)
    validation_notes = models.TextField(
        blank=True)
    start_time = models.DateTimeField(
        null=True)
    end_time = models.DateTimeField(
        null=True)
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False)
    public = models.BooleanField(
        default=False)
    output = models.FileField(
        upload_to=UPLOAD_TO,
        max_length=256,
        blank=True,
        null=True)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    def __str__(self):
        return self.name

    @classmethod
    def running(cls, owner):
        return cls.objects.filter(end_time__isnull=True, owner=owner)

    @classmethod
    def complete(cls, owner):
        return cls.objects.filter(end_time__isnull=False, owner=owner)

    def validate_and_save(self):
        validator = validation.AnalysisValidator(
            bin_anchor=self.get_anchor_display(),
            bin_start=self.bin_start,
            bin_number=self.bin_number,
            bin_size=self.bin_size,
            feature_bed=self.feature_list.dataset.path,
            chrom_sizes=get_chromosome_size_file(self.genome_assembly),
            stranded_bed=self.feature_list.stranded,
        )
        validator.validate()
        # intentionally omit post_save signal
        self.__class__.objects\
            .filter(id=self.id)\
            .update(
                validated=validator.is_valid,
                validation_notes=validator.display_errors())

    def get_absolute_url(self):
        return reverse('analysis:analysis', args=[self.pk, ])

    def get_execute_url(self):
        return reverse('analysis:analysis_execute', args=[self.pk, ])

    def get_visuals_url(self):
        return reverse('analysis:analysis_visual', args=[self.pk, ])

    def get_form_cancel_url(self):
        if self.id:
            return self.get_absolute_url()
        else:
            return reverse('analysis:dashboard')

    def get_update_url(self):
        return reverse('analysis:analysis_update', args=[self.pk, ])

    def get_delete_url(self):
        return reverse('analysis:analysis_delete', args=[self.pk, ])

    def get_zip_url(self):
        return reverse('analysis:analysis_zip', args=[self.pk, ])

    def reset_if_needed(self, dsIds):
        """
        If certain settings have changed, reset validation and output results.
        This method should be called from a changed form-instance, before
        saving.
        """
        formObj = self
        id_ = formObj.id
        reset = False
        if id_ is None:
            reset = True
        else:
            dbObj = self.__class__.objects.get(id=id_)
            for fld in [
                'anchor',
                'bin_start',
                'bin_number',
                'bin_size',
                'genome_assembly',
                'feature_list_id',
                'sort_vector_id',
            ]:
                if getattr(dbObj, fld) != getattr(formObj, fld):
                    reset = True
                    break

            dbIds = set(dbObj.analysisdatasets_set.values_list('dataset_id', flat=True))
            formIds = set(dsIds)
            if dbIds != formIds:
                reset = True

        if reset:
            logger.info('Analysis reset required %s' % id_)
            formObj.validated = False
            formObj.validation_notes = ''
            formObj.output = None
            formObj.start_time = None
            formObj.end_time = None
        else:
            logger.info('Analysis reset not required %s' % id_)

    @property
    def user_datasets(self):
        return UserDataset.objects.filter(id__in=self.datasets.values_list('id', flat=True))

    @property
    def encode_datasets(self):
        return EncodeDataset.objects.filter(id__in=self.datasets.values_list('id', flat=True))

    @property
    def analysis_user_datasets(self):
        return self.analysisdatasets_set.filter(dataset__in=self.user_datasets)

    @property
    def analysis_encode_datasets(self):
        return self.analysisdatasets_set.filter(dataset__in=self.encode_datasets)

    def get_form_datasets(self):
        uds = list(self.analysis_user_datasets.values('dataset_id', 'display_name'))
        eds = list(self.analysis_encode_datasets.values('dataset_id', 'display_name'))

        for ds in itertools.chain(uds, eds):
            ds['dataset'] = ds['dataset_id']
            del ds['dataset_id']

        return json.dumps({
            "userDatasets": uds,
            "encodeDatasets": eds,
        })

    class Meta:
        verbose_name_plural = 'Analyses'

    def user_can_view(self, user):
        if self.public:
            return True
        if self.owner == user:
            return True

    def get_flcm_ids(self):
        return list(self.analysisdatasets_set.values_list('count_matrix', flat=True))

    @property
    def is_complete(self):
        return True if self.start_time and self.end_time else False

    def execute(self):
        tasks.execute_analysis.delay(self.id)

    def create_matrix_list(self):
        return [
            [ads.count_matrix.id, ads.display_name, ads.count_matrix.matrix.path]
            for ads in self.analysisdatasets_set.all().prefetch_related('count_matrix')
        ]

    def execute_mat2mat(self):
        matrix_list = self.create_matrix_list()

        sv = None
        if self.sort_vector:
            sv = self.sort_vector.vector.path

        mm = MatrixByMatrix(
            matrix_list=matrix_list,
            window_start=self.bin_start,
            bin_number=self.bin_number,
            bin_size=self.bin_size,
            sort_vector=sv,
        )

        fn = get_random_filename(os.path.join(settings.MEDIA_ROOT, self.UPLOAD_TO))
        mm.writeJson(fn)

        return os.path.join(self.UPLOAD_TO, os.path.basename(fn))

    @property
    def output_json(self):
        # TODO: cache using redis
        if not hasattr(self, '_output_json'):
            with open(self.output.path, 'r') as f:
                output = json.loads(f.read())

            # convert JSON str keys to int keys
            sort_orders = output['sort_orders']
            for k, v in sort_orders.items():
                sort_orders[int(k)] = sort_orders.pop(k)

            self._output_json = output

        return self._output_json

    def get_summary_plot(self):
        if not self.output:
            return False
        output = self.output_json
        return {
            'dendrogram': output['dendrogram'],
            'max_abs_correlation_values': output['max_abs_correlation_values'],
            'cluster_members': output['cluster_members'],
            'correlation_matrix': output['correlation_matrix'],
            'matrix_ids': output['matrix_ids'],
            'matrix_names': output['matrix_names'],
            'cluster_medoids': output['cluster_medoids'],
            'feature_clusters': output['feature_clusters'],
            'feature_vectors': output['feature_vectors'],
            'feature_columns': output['feature_columns'],
            'feature_names': output['feature_names'],
            'feature_cluster_members': output['feature_cluster_members'],
        }

    def get_ks(self, id_):
        if not self.output:
            return False
        output = self.output_json
        return {'p-value': str(id_) + ': 0.05'}

    def get_sort_vector(self, id_):
        if not self.output:
            return False

        output = self.output_json

        so = output['sort_orders'].get(id_)
        if so is None:
            raise ValueError('Invalid id')

        return so

    def get_bin_names(self):
        flcm = FeatureListCountMatrix.objects\
            .filter(dataset__analysis=self.id)\
            .first()
        return list(flcm.df.columns)

    def get_scatterplot_data(self, idx, idy, column):
        x = AnalysisDatasets.objects\
            .filter(analysis_id=self.id, count_matrix=idx)\
            .select_related('count_matrix')\
            .first()
        y = AnalysisDatasets.objects\
            .filter(analysis_id=self.id, count_matrix=idy)\
            .select_related('count_matrix')\
            .first()

        xDf = x.count_matrix.df
        yDf = y.count_matrix.df

        if column not in xDf.columns:
            column = FeatureListCountMatrix.ALL_BINS

        xDf.rename(columns={column: 'x'}, inplace=True)
        yDf.rename(columns={column: 'y'}, inplace=True)

        xDf = xDf[['x']]
        yDf = yDf[['y']]

        return xDf.join(yDf).to_csv()

    def create_zip(self):
        """
        Create a zip file of output, specifically designed to recreate analysis,
        or to load analysis onto local development computers.
        """
        f = io.BytesIO()
        with zipfile.ZipFile(f, mode='w', compression=zipfile.ZIP_DEFLATED) as z:

            # write feature list
            z.write(self.feature_list.dataset.path, arcname='feature_list.txt')

            # write sort vector
            if self.sort_vector:
                z.write(self.sort_vector.vector.path, arcname='sort_vector.txt')

            # write output JSON
            if self.output:
                z.write(self.output.path, arcname='output.json')

            # write all intermediate count matrices
            for ds in self.analysisdatasets_set.all():
                z.write(ds.count_matrix.matrix.path, 'count_matrix/{}.txt'.format(ds.display_name))

        return f

    def send_completion_email(self):
        context = {
            'object': self,
            'domain': Site.objects.get_current().domain
        }
        send_mail(
            subject='Genomics: analysis complete',
            message=render_to_string(
                'analysis/analysis_complete_email.txt', context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[self.owner.email],
            html_message=render_to_string(
                'analysis/analysis_complete_email.html', context)
        )


class FeatureListCountMatrix(GenomicBinSettings):
    UPLOAD_TO = 'fcm/'

    feature_list = models.ForeignKey(
        FeatureList,
        related_name='intermediates')
    dataset = models.ForeignKey(
        GenomicDataset,
        related_name='intermediates')
    matrix = models.FileField(
        upload_to=UPLOAD_TO,
        max_length=256)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        verbose_name_plural = 'Feature list count matrices'

    ALL_BINS = 'All bins'

    @property
    def df(self):
        # get formatted pandas data frame
        key = 'flcm-%s' % self.id
        df = cache.get(key)
        if df is None:
            df = pd.read_csv(self.matrix.path, sep='\t')
            df.rename(columns={'Unnamed: 0': 'label'}, inplace=True)
            df.set_index('label', inplace=True, drop=True)
            df.insert(0, self.ALL_BINS, df.sum(axis=1))
            size = round(df.memory_usage(index=True).sum()/(1024*1024), 2)
            logger.info('Setting cache: {} ({}mb)'.format(key, size))
            cache.set(key, df, 300)

        return df

    @classmethod
    def execute(cls, analysis, dataset):
        # returns a new or existing FeatureListCountMatrix that matches the
        # specified criteria

        # Find existing instance
        existing = cls.objects.filter(
            feature_list=analysis.feature_list,
            dataset=dataset,
            anchor=analysis.anchor,
            bin_start=analysis.bin_start,
            bin_number=analysis.bin_number,
            bin_size=analysis.bin_size,
        ).first()
        if existing:
            return existing

        # existing not found; create instead
        fn = get_random_filename(os.path.join(settings.MEDIA_ROOT, cls.UPLOAD_TO))

        if dataset.is_stranded:
            bigwigs = [dataset.data_plus.path, dataset.data_minus.path]
        else:
            bigwigs = [dataset.data_ambiguous.path]

        BedMatrix(
            bigwigs=bigwigs,
            feature_bed=analysis.feature_list.dataset.path,
            output_matrix=fn,
            anchor=analysis.get_anchor_display(),
            bin_start=analysis.bin_start,
            bin_number=analysis.bin_number,
            bin_size=analysis.bin_size,
            opposite_strand_fn=None,
            stranded_bigwigs=dataset.is_stranded,
            stranded_bed=analysis.feature_list.stranded
        )

        return cls.objects.create(
            feature_list=analysis.feature_list,
            dataset=dataset,
            anchor=analysis.anchor,
            bin_start=analysis.bin_start,
            bin_number=analysis.bin_number,
            bin_size=analysis.bin_size,
            matrix=os.path.join(cls.UPLOAD_TO, os.path.basename(fn))
        )

    def get_dataset(self):
        # todo: cache matrix read
        with open(self.matrix.path, 'r') as f:
            return f.read()
