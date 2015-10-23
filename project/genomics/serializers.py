from rest_framework import serializers

from . import models


class ResultSerializerList(serializers.ModelSerializer):

    class Meta:
        model = models.Result
        fields = ('name', )


class ResultSerializerFull(serializers.ModelSerializer):
    url_plot = serializers.CharField(source='get_url_plot', read_only=True)

    class Meta:
        model = models.Result
        fields = ('name', 'url_plot', )
