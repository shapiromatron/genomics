import os
import platform
import shutil

from django.core.management.base import BaseCommand
from django.conf import settings

import requests


HELP_TEXT = """Download OS-specific UCSC software used in application."""


class Command(BaseCommand):

    help = HELP_TEXT

    REQUIRED_SOFTWARE = ('bigWigAverageOverBed', 'validateFiles', )

    def handle(self, *args, **options):
        system = platform.system()
        bits, _ = platform.architecture()

        # check architecture
        if bits != '64bit':
            raise OSError('64-bit architecture required.')

        # check platform
        if system == 'Darwin':
            root_url = 'http://hgdownload.soe.ucsc.edu/admin/exe/macOSX.x86_64'
        elif system == 'Linux':
            root_url = 'http://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64'
        else:
            raise OSError('Mac or Linux system required.')

        # download required software and place in appropriate location
        root_dl = os.path.join(settings.PROJECT_PATH, 'analysis', 'workflow')
        for fn in self.REQUIRED_SOFTWARE:
            url = os.path.join(root_url, fn)
            path = os.path.join(root_dl, fn)

            self.stdout.write("Downloading: {}".format(url))
            r = requests.get(url, stream=True)
            if r.status_code == 200:
                with open(path, 'wb') as f:
                    r.raw.decode_content = True
                    shutil.copyfileobj(r.raw, f)
                    os.chmod(path, 0o751)
            else:
                self.stderr.write("URL returned a non-200 status (possible error?)")

        self.stdout.write("Downloads complete!")
