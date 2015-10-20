import cPickle
import logging
from django.db import models
from django.conf import settings
from django.core.cache import cache
from django.core.urlresolvers import reverse

from picklefield.fields import PickledObjectField

from .plotting import heatmap


class Result(models.Model):

    MAX_HEATMAP_WIDTH = 250

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL)
    name = models.CharField(
        max_length=128)
    np_matrix = PickledObjectField(
        verbose_name="Matrix (numpy array)",
        protocol=2)
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        ordering = ('-last_updated', )

    def __unicode__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('genomics:result_detail', args=[self.id])


