from django_project.settings.base import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(';')

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

DATABASES['default']['NAME'] = os.environ.get("DB_NAME")
DATABASES['default']['USER'] = os.environ.get("DB_USER")
DATABASES['default']['PASSWORD'] = os.environ.get("DB_PASSWORD")

EMAIL_HOST = os.environ.get("DJANGO_EMAIL_HOST")
EMAIL_HOST_USER = os.environ.get("DJANGO_EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("DJANGO_EMAIL_HOST_PASSWORD")
EMAIL_PORT = os.environ.get("DJANGO_EMAIL_PORT")

PUBLIC_ROOT = os.environ.get("DJANGO_PUBLIC_PATH")
STATIC_ROOT = os.path.join(PUBLIC_ROOT, 'static')
MEDIA_ROOT = os.path.join(PUBLIC_ROOT, 'media')
