# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0002_auto_20151216_1041'),
    ]

    operations = [
        migrations.RenameField(
            model_name='analysis',
            old_name='features',
            new_name='feature_list',
        ),
    ]
