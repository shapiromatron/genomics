# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-01-28 19:12
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0010_auto_20160119_1311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='genomicdataset',
            name='genome_assembly',
            field=models.PositiveSmallIntegerField(choices=[(1, 'hg19'), (2, 'mm9')], db_index=True),
        ),
    ]
