from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import api, views

router = DefaultRouter()
router.register('analysis', api.AnalysisViewset, base_name='analysis')
router.register('user-dataset', api.UserDatasetViewset, base_name='user-dataset')
router.register('encode-dataset', api.EncodeDatasetViewset, base_name='encode-dataset')
router.register('feature-list', api.FeatureListViewset, base_name='feature-list')
router.register('sort-vector', api.SortVectorViewset, base_name='sort-vector')


urlpatterns = [

    url(r'^api/',
        include(router.urls, namespace='api')),

    url(r'^analysis/(?P<pk>\d+)/execute/$',
        views.Execute.as_view(),
        name='execute'),

    url(r'^',
        views.Dashboard.as_view(),
        name='dashboard'),

]
