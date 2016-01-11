# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-01-08 21:49
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0007_auto_20160108_1536'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysis',
            name='bin_number',
            field=models.PositiveIntegerField(default=50, validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(250)]),
        ),
        migrations.AlterField(
            model_name='analysis',
            name='bin_size',
            field=models.PositiveIntegerField(default=100, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AlterField(
            model_name='analysis',
            name='bin_start',
            field=models.IntegerField(default=-2500),
        ),
        migrations.AlterField(
            model_name='featurelistcountmatrix',
            name='bin_number',
            field=models.PositiveIntegerField(default=50, validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(250)]),
        ),
        migrations.AlterField(
            model_name='featurelistcountmatrix',
            name='bin_size',
            field=models.PositiveIntegerField(default=100, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AlterField(
            model_name='featurelistcountmatrix',
            name='bin_start',
            field=models.IntegerField(default=-2500),
        ),
    ]