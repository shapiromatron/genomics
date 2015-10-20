from rest_framework import serializers

from . import models


class ResultSerializerList(serializers.ModelSerializer):

    class Meta:
        model = models.Result
        fields = ('name', )


class ResultSerializerFull(serializers.ModelSerializer):

    class Meta:
        model = models.Result
        fields = ('name', 'user')
