# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0005_featurelist_genome_assembly'),
    ]

    operations = [
        migrations.AlterField(
            model_name='encodedataset',
            name='cell_type',
            field=models.CharField(max_length=32),
        ),
    ]
