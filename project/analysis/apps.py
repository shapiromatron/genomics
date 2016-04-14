from django.apps import AppConfig
from django.conf import settings

from django.core.management import call_command

import os


class MyConfig(AppConfig):
    name = 'analysis'
    verbose_name = 'Analysis'

    def ready(self):

        # make sure download paths exist
        paths = [
            os.path.abspath(os.path.join(settings.MEDIA_ROOT, 'fcm')),
            os.path.abspath(os.path.join(settings.MEDIA_ROOT, 'analysis'))
        ]
        for path in paths:
            if not os.path.exists(path):
                os.makedirs(path)

        # download UCSC tools if needed
        tools = [
            os.path.abspath(os.path.join(settings.PROJECT_PATH, 'analysis', 'workflow', 'bigWigAverageOverBed')),
            os.path.abspath(os.path.join(settings.PROJECT_PATH, 'analysis', 'workflow', 'validateFiles')),
        ]
        for tool in tools:
            if not os.path.exists(tool):
                call_command('download_ucsc_tools')
