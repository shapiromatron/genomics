from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from utils.api import SiteMixin

from . import models, serializers


class ResultViewset(SiteMixin, viewsets.ModelViewSet):

    def get_serializer_class(self):
        if self.action == "list":
            return serializers.ResultSerializerList
        return serializers.ResultSerializerFull

    def get_queryset(self):
        return models.Result.objects\
            .filter(user=self.request.user)\
            .order_by('last_updated')

    @detail_route(methods=['get'])
    def dataset(self, request, pk):

        start = 0
        try:
            start = int(self.request.query_params.get('start', start))
            start = max(start, 0)
        except ValueError:
            pass

        width = -1
        try:
            width = int(self.request.query_params.get('width', width))
        except ValueError:
            pass

        object_ = get_object_or_404(models.Result, pk=pk)
        response = object_.get_heatmap_dataset(start, width)
        return Response(response)
