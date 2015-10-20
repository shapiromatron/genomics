from rest_framework import viewsets

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
