# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0003_auto_20151228_1524'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysis',
            name='genome_assembly',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, 'hg19'), (2, 'mm9')]),
            preserve_default=False,
        ),
    ]
