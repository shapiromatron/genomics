# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0004_analysis_genome_assembly'),
    ]

    operations = [
        migrations.AddField(
            model_name='featurelist',
            name='genome_assembly',
            field=models.PositiveSmallIntegerField(choices=[(1, 'hg19'), (2, 'mm9')], default=1),
            preserve_default=False,
        ),
    ]
