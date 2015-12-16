from django.contrib import admin

from . import models


class UserDatasetAdmin(admin.ModelAdmin):
    pass


class EncodeDatasetAdmin(admin.ModelAdmin):
    pass


class FeatureListAdmin(admin.ModelAdmin):
    pass


class SortVectorAdmin(admin.ModelAdmin):
    pass


class AnalysisDatasetsAdmin(admin.ModelAdmin):
    pass


class AnalysisAdmin(admin.ModelAdmin):
    pass


class FeatureListCountMatrixAdmin(admin.ModelAdmin):
    pass


class DatasetCorrelationMatrixAdmin(admin.ModelAdmin):
    pass


admin.site.register(models.UserDataset, UserDatasetAdmin)
admin.site.register(models.EncodeDataset, EncodeDatasetAdmin)
admin.site.register(models.FeatureList, FeatureListAdmin)
admin.site.register(models.SortVector, SortVectorAdmin)
admin.site.register(models.AnalysisDatasets, AnalysisDatasetsAdmin)
admin.site.register(models.Analysis, AnalysisAdmin)
admin.site.register(models.FeatureListCountMatrix, FeatureListCountMatrixAdmin)
admin.site.register(models.DatasetCorrelationMatrix, DatasetCorrelationMatrixAdmin)
