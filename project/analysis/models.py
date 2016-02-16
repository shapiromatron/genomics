import json
import uuid
import random

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.urlresolvers import reverse
from django.contrib.postgres.fields import JSONField

from utils.models import ReadOnlyFileSystemStorage


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
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    def __str__(self):
        return self.name

    def get_execute_url(self):
        return reverse('analysis:execute', args=[self.pk, ])

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

    def get_summary_plot(self):
        if not hasattr(self, 'datasetcorrelationmatrix'):
            return False
        return self.datasetcorrelationmatrix.get_summary_plot_data()

    def get_sort_vector(self, id_):
        if not hasattr(self, 'datasetcorrelationmatrix'):
            return False
        return self.datasetcorrelationmatrix.get_sort_vector(id_)


class FeatureListCountMatrix(GenomicBinSettings):
    feature_list = models.ForeignKey(
        FeatureList,
        related_name='intermediates')
    dataset = models.ForeignKey(
        GenomicDataset,
        related_name='intermediates')
    matrix = models.FileField(
        max_length=256)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        verbose_name_plural = 'Feature list count matrices'

    def get_dataset(self):
        # todo: cache matrix read
        with self.matrix.open() as f:
            data = f.read()
        return data


class DatasetCorrelationMatrix(models.Model):
    analysis = models.OneToOneField(Analysis)
    matrix = models.FileField(
        max_length=256)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        verbose_name_plural = 'Dataset correlation matrices'

    def get_summary_plot_data(self):
        # todo: cache matrix read
        with self.matrix.open() as f:
            data = json.loads(f.read())
        return {
            'dendrogram': data['dendrogram'],
            'max_abs_correlation_values': data['max_abs_correlation_values'],
            'cluster_members': data['cluster_members'],
            'correlation_matrix': data['correlation_matrix'],
        }

    def get_sort_vector(self, id_):
        # todo: get specific sort-vector instead of random
        # todo: cache matrix read
        with self.matrix.open() as f:
            data = json.loads(f.read())
        idx = random.randint(0, len(data['sort_orders'])-1)
        return data['sort_orders'][idx]
