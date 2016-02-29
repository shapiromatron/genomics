import json
import os
import uuid
import random

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.urlresolvers import reverse
from django.contrib.postgres.fields import JSONField

from utils.models import ReadOnlyFileSystemStorage, get_random_filename

from .import tasks

from .workflow.matrix import BedMatrix
from .workflow.matrixByMatrix import MatrixByMatrix


encode_store = ReadOnlyFileSystemStorage.create_store(settings.ENCODE_PATH)


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
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


HG19 = 1
MM9 = 2
GENOME_ASSEMBLY_CHOICES = (
    (HG19, 'hg19'),
    (MM9,  'mm9'),
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
        return self.data_ambiguous.name == ''


class UserDataset(GenomicDataset):
    data_ambiguous = models.FileField(
        blank=True,
        max_length=256)
    data_plus = models.FileField(
        blank=True,
        max_length=256)
    data_minus = models.FileField(
        blank=True,
        max_length=256)
    url = models.URLField(
        max_length=256,
        null=True)
    expiration_date = models.DateTimeField(
        null=True)


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
        for fld in fields:
            dicts[fld] = cls.objects.values_list(fld, flat=True).distinct().order_by(fld)
        return dicts


class FeatureList(Dataset):
    genome_assembly = models.PositiveSmallIntegerField(
        choices=GENOME_ASSEMBLY_CHOICES)
    stranded = models.BooleanField(
        default=True)
    dataset = models.FileField(
        blank=True,
        max_length=256)


class SortVector(Dataset):
    feature_list = models.ForeignKey(
        FeatureList)
    text = models.TextField(
        blank=True)


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
        null=True)
    validated = models.BooleanField(
        default=False)
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

    def get_execute_url(self):
        return reverse('analysis:execute', args=[self.pk, ])

    def get_visuals_url(self):
        return reverse('analysis:visual_testing', args=[self.pk, ])

    @property
    def user_datasets(self):
        return UserDataset.objects.filter(id__in=self.datasets.values_list('id', flat=True))

    @property
    def encode_datasets(self):
        return EncodeDataset.objects.filter(id__in=self.datasets.values_list('id' ,flat=True))

    @property
    def analysis_user_datasets(self):
        return self.analysisdatasets_set.filter(dataset__in=self.user_datasets)

    @property
    def analysis_encode_datasets(self):
        return self.analysisdatasets_set.filter(dataset__in=self.encode_datasets)

    class Meta:
        verbose_name_plural = 'Analyses'

    def get_flcm_ids(self):
        return list(self.analysisdatasets_set.values_list('count_matrix', flat=True))

    @property
    def status(self):
        if self.start_time:
            return 'COMPLETE' if self.end_time else 'RUNNING'
        else:
            return 'NOT STARTED'

    def execute(self):
        tasks.execute_analysis.delay(self.id)

    def create_matrix_list(self):
        return [
            [ads.id, ads.display_name, ads.count_matrix.matrix.path]
            for ads in self.analysisdatasets_set.all().prefetch_related('count_matrix')
        ]

    def execute_mat2mat(self):
        matrix_list = self.create_matrix_list()

        sv = None
        if self.sort_vector:
            sv = self.sort_vector.text   # todo - use file?

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
                self._output_json = json.loads(f.read())
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
            'cluster_medoids': output['cluster_medoids']
        }

    def get_sort_vector(self, id_):
        if not self.output:
            return False
        # todo: get specific sort-vector instead of random
        output = self.output_json
        idx = random.randint(0, len(output['sort_orders'])-1)
        return output['sort_orders'][idx]


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
