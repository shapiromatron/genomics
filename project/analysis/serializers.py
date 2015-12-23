from rest_framework import serializers

from . import models


class UserDatasetSerializer(serializers.ModelSerializer):
    genome_assembly_display = serializers.ReadOnlyField(source="get_genome_assembly_display")

    class Meta:
        model = models.UserDataset
        fields = '__all__'
        read_only_fields = ('validated', 'expiration_date', 'owner', 'borrowers')


class FeatureListSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.FeatureList
        fields = '__all__'
        read_only_fields = ('validated', 'owner', 'borrowers')


class SortVectorSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.SortVector
        fields = '__all__'
        read_only_fields = ('validated', 'owner', 'borrowers')


class EncodeDatasetSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.EncodeDataset
        fields = '__all__'


class AnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Analysis
        fields = '__all__'
        read_only_fields = ('validated', 'start_time', 'end_time', 'owner')
