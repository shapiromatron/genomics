# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-22 19:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0026_auto_20160422_1412'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdataset',
            name='data_type',
            field=models.CharField(choices=[('Cage', 'Cage'), ('ChiaPet', 'ChiaPet'), ('ChipSeq', 'ChipSeq'), ('DnaseDgf', 'DnaseDgf'), ('DnaseSeq', 'DnaseSeq'), ('FaireSeq', 'FaireSeq'), ('Mapability', 'Mapability'), ('Nucleosome', 'Nucleosome'), ('Orchid', 'Orchid'), ('RepliChip', 'RepliChip'), ('RepliSeq', 'RepliSeq'), ('RipSeq', 'RipSeq'), ('RnaPet', 'RnaPet'), ('RnaSeq', 'RnaSeq'), ('SmartSeq', 'SmartSeq'), ('Other', 'Other (describe in "description" field)')], default='Other', max_length=16),
            preserve_default=False,
        ),
    ]
