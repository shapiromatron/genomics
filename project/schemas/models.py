import uuid

from django.db import models
from django.conf import settings


# python manage.py graph_models -g -o schemas.png --pydot schemas && open schemas.py


class Dataset(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        related_name="%(class)s",)
    borrowers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="%(class)s_borrowers",
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


HG19 = 1
MM9 = 2
GENOME_ASSEMBLY_CHOICES = (
    (HG19, 'hg19'),
    (MM9,  'mm9'),
)


class GenomicDataset(Dataset):
    genome_assembly = models.PositiveSmallIntegerField(
        choices=GENOME_ASSEMBLY_CHOICES)
    binary = models.FileField(
        max_length=256)


class UserDataset(GenomicDataset):
    url = models.URLField(
        max_length=256,
        null=True)
    expiration_date = models.DateTimeField(
        null=True)


class EncodeDataset(GenomicDataset):
    data_type = models.CharField(
        max_length=16)
    antibody = models.CharField(
        max_length=32,
        blank=True)
    rna_extract = models.CharField(
        max_length=32,
        blank=True)
    treatment = models.CharField(
        max_length=32,
        blank=True)
    phase = models.CharField(
        max_length=32,
        blank=True)
    localization = models.CharField(
        max_length=32,
        blank=True)


class FeatureList(Dataset):
    text = models.TextField(
        blank=True)


class SortVector(Dataset):
    text = models.TextField(
        blank=True)


class AnalysisDatasets(models.Model):
    analysis = models.ForeignKey(
        'Analysis')
    dataset = models.ForeignKey(
        'GenomicDataset')
    display_name = models.CharField(
        max_length=128)
    intermediate_matrix = models.ForeignKey(
        'IntermediateMatrix',
        null=True)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)


class Analysis(models.Model):
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
    features = models.ForeignKey(
        FeatureList)
    sort_vector = models.ForeignKey(
        SortVector,
        null=True)
    validated = models.BooleanField(
        default=False)
    completed = models.BooleanField(
        default=False)
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False)
    public = models.BooleanField(
        default=False)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)


class IntermediateMatrix(models.Model):
    feature_list = models.ForeignKey(
        FeatureList,
        related_name="intermediates")
    dataset = models.ForeignKey(
        GenomicDataset,
        related_name="intermediates")
    matrix = models.FileField(
        max_length=256)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)


class DatasetCorrelationMatrix(models.Model):
    analysis = models.OneToOneField(Analysis)
    matrix = models.FileField(
        max_length=256)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)
