# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-22 17:21
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0024_auto_20160422_1019'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userdataset',
            name='url_ambiguous',
        ),
        migrations.RemoveField(
            model_name='userdataset',
            name='url_minus',
        ),
        migrations.RemoveField(
            model_name='userdataset',
            name='url_plus',
        ),
    ]
