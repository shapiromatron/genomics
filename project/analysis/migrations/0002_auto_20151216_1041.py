# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='analysis',
            options={'verbose_name_plural': 'Analyses'},
        ),
        migrations.AlterModelOptions(
            name='analysisdatasets',
            options={'verbose_name_plural': 'Analysis datasets'},
        ),
        migrations.AlterModelOptions(
            name='datasetcorrelationmatrix',
            options={'verbose_name_plural': 'Dataset correlation matrices'},
        ),
        migrations.AlterModelOptions(
            name='featurelistcountmatrix',
            options={'verbose_name_plural': 'Feature list count matrices'},
        ),
        migrations.AlterField(
            model_name='datasetcorrelationmatrix',
            name='matrix',
            field=models.FileField(max_length=256, upload_to=''),
        ),
        migrations.AlterField(
            model_name='featurelistcountmatrix',
            name='matrix',
            field=models.FileField(max_length=256, upload_to=''),
        ),
        migrations.AlterField(
            model_name='genomicdataset',
            name='data_ambiguous',
            field=models.FileField(max_length=256, blank=True, upload_to=''),
        ),
        migrations.AlterField(
            model_name='genomicdataset',
            name='data_minus',
            field=models.FileField(max_length=256, blank=True, upload_to=''),
        ),
        migrations.AlterField(
            model_name='genomicdataset',
            name='data_plus',
            field=models.FileField(max_length=256, blank=True, upload_to=''),
        ),
        migrations.AlterField(
            model_name='genomicdataset',
            name='genome_assembly',
            field=models.PositiveSmallIntegerField(choices=[(1, 'hg19'), (2, 'mm9')]),
        ),
    ]
