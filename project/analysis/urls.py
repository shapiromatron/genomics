from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import api, views

router = DefaultRouter()
router.register(r'analysis', api.AnalysisViewset, base_name="analysis")
router.register(r'user-dataset', api.UserDatasetViewset, base_name="user-dataset")
router.register(r'encode-dataset', api.EncodeDatasetViewset, base_name="encode-dataset")
router.register(r'feature-list', api.FeatureListViewset, base_name="feature-list")
router.register(r'sort-vector', api.SortVectorViewset, base_name="sort-vector")


urlpatterns = [

    url(r'^api/',
        include(router.urls, namespace="api")),

    url(r'^',
        views.Dashboard.as_view(),
        name='dashboard'),
]
