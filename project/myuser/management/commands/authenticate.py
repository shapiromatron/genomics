from django.core.management.base import BaseCommand
from django.contrib.auth import authenticate

HELP_TEXT = """Given a username and password, authenticate"""


class Command(BaseCommand):
    help = HELP_TEXT

    def add_arguments(self, parser):
        parser.add_argument('username')
        parser.add_argument('password')

    def handle(self, *args, **options):
        username = options.get('username')
        password = options.get('password')
        user = authenticate(username=username, password=password)
        if user:
            self.stdout.write('Authenticated')
        else:
            self.stdout.write('Not authenticated')
