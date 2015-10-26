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

    def get_absolute_url2(self):
        return reverse('genomics:result_detail2', args=[self.id])

    def get_url_plot(self):
        return reverse('genomics:api:result-plot', args=[self.id])

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
            matrix = self.np_matrix.ix[:, 6:].as_matrix().astype(np.float64)
            assert matrix.dtype == np.float64
            mPickle = cPickle.dumps(matrix, protocol=2)
            logging.info("Setting cache...")
            cache.set(self.matrix_cache_key, mPickle)
            self._matrix = matrix
        else:
            logging.info("Using cache...")
            matrix = cPickle.loads(matrix)
        return matrix

    def get_plot_data(self):
        dataset = self.get_heatmap_dataset(aslist=False)
        return heatmap.Heatmap.to_bokeh_source(dataset)

    def get_plot_data2(self, start, width):
        dataset = self.get_heatmap_dataset(start=start, width=width, aslist=True)
        return dataset

    def get_plot(self):
        dataset = self.get_heatmap_dataset(aslist=False)
        plot = heatmap.Heatmap(dataset)
        return plot.as_json()

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
            subset = imresize(subset, (self.MAX_HEATMAP_WIDTH, shape[1]), interp="bilinear", mode="F")
        else:
            response["scaled"] = False

        if aslist:
            response["matrix"] = subset.tolist()
        else:
            response["matrix"] = subset

        return response
