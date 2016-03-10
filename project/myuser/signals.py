import os

from django.db.models.signals import post_save
from django.dispatch import receiver

from . import models


@receiver(post_save, sender=models.User)
def create_user_path(sender, instance, **kwargs):
    os.makedirs(instance.path, mode=0o770, exist_ok=True)
