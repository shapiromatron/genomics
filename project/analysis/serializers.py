from rest_framework import serializers

from . import models


class UserDatasetSerializer(serializers.ModelSerializer):
    genome_assembly_display = serializers.ReadOnlyField(source='get_genome_assembly_display')

    class Meta:
        model = models.UserDataset
        fields = '__all__'
        read_only_fields = ('validated', 'expiration_date', 'owner', 'borrowers')


class FeatureListSerializer(serializers.ModelSerializer):
    genome_assembly_display = serializers.ReadOnlyField(source='get_genome_assembly_display')

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
        exclude = (
           'public', 'validated', 'owner',
           'borrowers', 'created', 'last_updated',
           'data_plus', 'data_minus', 'data_ambiguous',
           'uuid',
        )


class AnalysisDatasetsSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.AnalysisDatasets
        fields = ('id', 'dataset', 'display_name')


class AnalysisSerializer(serializers.ModelSerializer):
    datasets = AnalysisDatasetsSerializer(source='analysisdatasets_set', many=True)
    genome_assembly_display = serializers.ReadOnlyField(source='get_genome_assembly_display')
    anchor_display = serializers.ReadOnlyField(source='get_anchor_display')

    class Meta:
        model = models.Analysis
        fields = '__all__'
        read_only_fields = ('validated', 'start_time', 'end_time', 'owner')

    def create_analysis_datasets(self, analysis, datasets):
        analysis.analysisdatasets_set.all().delete()
        objects = [
            models.AnalysisDatasets(
                analysis_id=analysis.id,
                dataset_id=d['dataset'].id,
                display_name=d['display_name']
            ) for d in datasets
        ]
        models.AnalysisDatasets.objects.bulk_create(objects)

    def create(self, validated_data):
        datasets = validated_data.pop('analysisdatasets_set', [])
        instance = super().create(validated_data)
        self.create_analysis_datasets(instance, datasets)
        return instance

    def update(self, instance, validated_data):
        datasets = validated_data.pop('analysisdatasets_set', [])
        instance = super().update(instance, validated_data)
        self.create_analysis_datasets(instance, datasets)
        return instance
