import cPickle
import logging
import numpy as np
from scipy.misc import imresize

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

    @property
    def matrix_cache_key(self):
        return "result-{}".format(self.id)

    @property
    def matrix(self):
        # set instance cache
        if hasattr(self, "_matrix"):
            return self._matrix

        # set persistent cache
        matrix = cache.get(self.matrix_cache_key)
        if matrix is None:
            matrix = self.np_matrix.ix[:, 6:].as_matrix()
            assert matrix.dtype == np.int64
            mPickle = cPickle.dumps(matrix, protocol=2)
            logging.info("Setting cache...")
            cache.set(self.matrix_cache_key, mPickle)
            self._matrix = matrix
        else:
            logging.info("Using cache...")
            matrix = cPickle.loads(matrix)
        return matrix

    def heatmap(self):
        return heatmap.fixed_chart(self)

    def get_heatmap_dataset(self, start=0, width=-1, aslist=True):
        matrix = self.matrix
        shape = matrix.shape
        response = {
            "name": self.name,
            "shape": shape,
            "start": start,
        }

        # slice matrix to subset
        subset = matrix
        if width > 0:
            subset = matrix[start:start+width, :]
            response['width'] = width
        else:
            response['width'] = shape[0]

        # resize image if greater than maximum size
        if width > self.MAX_HEATMAP_WIDTH or width < 1:
            response["scaled"] = True
            subset = imresize(subset, (self.MAX_HEATMAP_WIDTH, shape[1]), interp="bilinear")
        else:
            response["scaled"] = False

        if aslist:
            response["matrix"] = subset.tolist()
        else:
            response["matrix"] = subset

        return response
