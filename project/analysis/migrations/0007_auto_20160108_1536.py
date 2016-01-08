# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0006_auto_20151231_1246'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysis',
            name='anchor',
            field=models.PositiveSmallIntegerField(default=1, choices=[(0, 'start'), (1, 'center'), (2, 'end')]),
        ),
        migrations.AddField(
            model_name='analysis',
            name='bin_number',
            field=models.PositiveSmallIntegerField(default=50, validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(250)]),
        ),
        migrations.AddField(
            model_name='analysis',
            name='bin_size',
            field=models.PositiveSmallIntegerField(default=100, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AddField(
            model_name='analysis',
            name='bin_start',
            field=models.SmallIntegerField(default=-2500),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='anchor',
            field=models.PositiveSmallIntegerField(default=1, choices=[(0, 'start'), (1, 'center'), (2, 'end')]),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='bin_number',
            field=models.PositiveSmallIntegerField(default=50, validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(250)]),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='bin_size',
            field=models.PositiveSmallIntegerField(default=100, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='bin_start',
            field=models.SmallIntegerField(default=-2500),
        ),
    ]
