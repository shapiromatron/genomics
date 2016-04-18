from django.db.models.signals import post_save
from django.dispatch import receiver

from . import tasks, models


@receiver(post_save, sender=models.UserDataset)
def trigger_download(sender, instance, **kwargs):
    tasks.download_user_datasets.delay(instance.id)
