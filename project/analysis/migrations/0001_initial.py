# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Analysis',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('validated', models.BooleanField(default=False)),
                ('start_time', models.DateTimeField(null=True)),
                ('end_time', models.DateTimeField(null=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='AnalysisDatasets',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('display_name', models.CharField(max_length=128)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('analysis', models.ForeignKey(to='analysis.Analysis')),
            ],
        ),
        migrations.CreateModel(
            name='DatasetCorrelationMatrix',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('matrix', models.FileField(max_length=256, upload_to=b'')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('analysis', models.OneToOneField(to='analysis.Analysis')),
            ],
        ),
        migrations.CreateModel(
            name='FeatureList',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('stranded', models.BooleanField(default=True)),
                ('text', models.TextField(blank=True)),
                ('borrowers', models.ManyToManyField(related_name='featurelist_borrowers', to=settings.AUTH_USER_MODEL, blank=True)),
                ('owner', models.ForeignKey(related_name='featurelist', to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='FeatureListCountMatrix',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('matrix', models.FileField(max_length=256, upload_to=b'')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='GenomicDataset',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('genome_assembly', models.PositiveSmallIntegerField(choices=[(1, b'hg19'), (2, b'mm9')])),
                ('data_ambiguous', models.FileField(max_length=256, upload_to=b'', blank=True)),
                ('data_plus', models.FileField(max_length=256, upload_to=b'', blank=True)),
                ('data_minus', models.FileField(max_length=256, upload_to=b'', blank=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SortVector',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('text', models.TextField(blank=True)),
                ('borrowers', models.ManyToManyField(related_name='sortvector_borrowers', to=settings.AUTH_USER_MODEL, blank=True)),
                ('feature_list', models.ForeignKey(to='analysis.FeatureList')),
                ('owner', models.ForeignKey(related_name='sortvector', to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='EncodeDataset',
            fields=[
                ('genomicdataset_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='analysis.GenomicDataset')),
                ('data_type', models.CharField(max_length=16)),
                ('cell_type', models.CharField(max_length=16)),
                ('antibody', models.CharField(max_length=32, blank=True)),
                ('rna_extract', models.CharField(max_length=32, blank=True)),
                ('treatment', models.CharField(max_length=32, blank=True)),
                ('phase', models.CharField(max_length=32, blank=True)),
                ('localization', models.CharField(max_length=32, blank=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('analysis.genomicdataset',),
        ),
        migrations.CreateModel(
            name='UserDataset',
            fields=[
                ('genomicdataset_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='analysis.GenomicDataset')),
                ('url', models.URLField(max_length=256, null=True)),
                ('expiration_date', models.DateTimeField(null=True)),
            ],
            options={
                'abstract': False,
            },
            bases=('analysis.genomicdataset',),
        ),
        migrations.AddField(
            model_name='genomicdataset',
            name='borrowers',
            field=models.ManyToManyField(related_name='genomicdataset_borrowers', to=settings.AUTH_USER_MODEL, blank=True),
        ),
        migrations.AddField(
            model_name='genomicdataset',
            name='owner',
            field=models.ForeignKey(related_name='genomicdataset', to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='dataset',
            field=models.ForeignKey(related_name='intermediates', to='analysis.GenomicDataset'),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='feature_list',
            field=models.ForeignKey(related_name='intermediates', to='analysis.FeatureList'),
        ),
        migrations.AddField(
            model_name='analysisdatasets',
            name='count_matrix',
            field=models.ForeignKey(to='analysis.FeatureListCountMatrix', null=True),
        ),
        migrations.AddField(
            model_name='analysisdatasets',
            name='dataset',
            field=models.ForeignKey(to='analysis.GenomicDataset'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='datasets',
            field=models.ManyToManyField(to='analysis.GenomicDataset', through='analysis.AnalysisDatasets'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='features',
            field=models.ForeignKey(to='analysis.FeatureList'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='owner',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='analysis',
            name='sort_vector',
            field=models.ForeignKey(to='analysis.SortVector', null=True),
        ),
    ]
