import os
import sys
from django_project.settings.base import *


INSTALLED_APPS += (
    'debug_toolbar',
    'django_extensions',
)

INTERNAL_IPS = ('127.0.0.1', )

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

CACHES['default']['BACKEND'] = 'django.core.cache.backends.locmem.LocMemCache'

LOGGING['loggers']['']['handlers'] = ['console']

# execute celery-tasks locally instead of sending to queue
CELERY_ALWAYS_EAGER = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

COMPRESS_ENABLED = False

if 'test' in sys.argv:
    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.SHA1PasswordHasher',
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )

# to use jupyter, `add2virtualenv .` the project path
NOTEBOOK_ARGUMENTS = [
    '--notebook-dir',
    os.path.join(PROJECT_ROOT, 'notebooks')
]
