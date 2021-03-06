# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-18 19:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0020_auto_20160418_1448'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdataset',
            name='url_ambiguous',
            field=models.URLField(blank=True, help_text='URL for downloading user-dataset, must be publicly available without authentication.', verbose_name='URL (strands unspecified)'),
        ),
        migrations.AddField(
            model_name='userdataset',
            name='url_minus',
            field=models.URLField(blank=True, help_text='URL for downloading user-dataset, must be publicly available without authentication.', verbose_name='URL (minus-strand)'),
        ),
        migrations.AddField(
            model_name='userdataset',
            name='url_plus',
            field=models.URLField(blank=True, help_text='URL for downloading user-dataset, must be publicly available without authentication.', verbose_name='URL (plus-strand)'),
        ),
    ]
