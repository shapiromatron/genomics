from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from rest_framework import viewsets, filters
from rest_framework.decorators import list_route
from rest_framework.response import Response
from utils.api import SiteMixin, OwnedButShareableMixin, NoPagination
from . import models, serializers


def owner_or_public(user):
    query = Q(public=True)
    if not isinstance(user, AnonymousUser):
        query = query | Q(owner=user)
    return query


class EncodeDatasetViewset(SiteMixin, viewsets.ReadOnlyModelViewSet):
    filter_backends = (filters.DjangoFilterBackend, )
    filter_fields = (
        'genome_assembly', '=data_type', '=cell_type',
        '=antibody', '=rna_extract', '=treatment',
        '=phase', '=localization',
    )

    @list_route()
    def field_options(self, request):
        opts = models.EncodeDataset.get_field_options()
        return Response(opts)

    def get_serializer_class(self):
        return serializers.EncodeDatasetSerializer

    def get_queryset(self):
        return models.EncodeDataset.objects.all()


class UserDatasetViewset(OwnedButShareableMixin, viewsets.ModelViewSet):
    pagination_class = NoPagination

    def get_serializer_class(self):
        return serializers.UserDatasetSerializer

    def get_queryset(self):
        query = owner_or_public(self.request.user)
        return models.UserDataset.objects.filter(query)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class FeatureListViewset(OwnedButShareableMixin, viewsets.ModelViewSet):
    pagination_class = NoPagination

    def get_serializer_class(self):
        return serializers.FeatureListSerializer

    def get_queryset(self):
        query = owner_or_public(self.request.user)
        return models.FeatureList.objects.filter(query)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SortVectorViewset(OwnedButShareableMixin, viewsets.ModelViewSet):
    pagination_class = NoPagination

    def get_serializer_class(self):
        return serializers.SortVectorSerializer

    def get_queryset(self):
        query = owner_or_public(self.request.user)
        return models.SortVector.objects.filter(query)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AnalysisViewset(OwnedButShareableMixin, viewsets.ModelViewSet):
    pagination_class = NoPagination

    def get_serializer_class(self):
        return serializers.AnalysisSerializer

    def get_queryset(self):
        query = owner_or_public(self.request.user)
        return models.Analysis.objects.filter(query)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
