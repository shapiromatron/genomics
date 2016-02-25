import os
from django.conf import settings
from django.core.management.base import BaseCommand
import re


HELP_TEXT = """Build custom WSGI file for running w/ apache server, including environment variables, which are usually injected w/ the postactivate call."""

INJ_TARGET = "from django.core.wsgi import get_wsgi_application"
INJECTION_TMPL = """
# add environment variables:
{{}}

# resume wsgi instantiation
{}
"""


class Command(BaseCommand):

    help = HELP_TEXT

    def get_wsgi_template(self):
        wsgi = os.path.join(
            settings.PROJECT_PATH,
            'django_project',
            'wsgi.py'
        )

        with open(wsgi, 'r') as f:
            template = f.read()

        return template.replace(INJ_TARGET, INJECTION_TMPL.format(INJ_TARGET))

    def handle(self, *args, **options):

        # input file
        postactivate = os.path.join(
            os.environ.get('VIRTUAL_ENV'),
            'bin',
            'postactivate'
        )

        # output file
        wsgi = os.path.join(
            settings.PROJECT_PATH,
            'django_project',
            'apache_wsgi.py'
        )

        if not os.path.exists(postactivate):
            return self.stdout.write('postactivate not found')

        re_export = re.compile('export "([\w_]+)=(.+)"')
        envs = []
        with open(postactivate, 'r') as f:
            for line in f.readlines():
                result = re_export.match(line)
                if result:
                    grps = result.groups()
                    if grps[0] != 'PATH':
                        envs.append("os.environ.setdefault('''{}''', '''{}''')".format(grps[0], grps[1]))

        tmpl = self.get_wsgi_template()
        tmpl = tmpl.format('\n'.join(envs))

        with open(wsgi, 'w') as f:
            f.write(tmpl)
