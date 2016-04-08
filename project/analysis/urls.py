from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import api, views

router = DefaultRouter()
router.register('analysis', api.AnalysisViewset, base_name='analysis')
router.register('user-dataset', api.UserDatasetViewset, base_name='user-dataset')
router.register('encode-dataset', api.EncodeDatasetViewset, base_name='encode-dataset')
router.register('feature-list', api.FeatureListViewset, base_name='feature-list')
router.register('sort-vector', api.SortVectorViewset, base_name='sort-vector')
router.register('feature-list-count-matrix', api.FeatureListCountMatrixViewset, base_name="flcm")


urlpatterns = [

    url(r'^api/',
        include(router.urls, namespace='api')),

    url(r'^analysis/(?P<pk>\d+)/visuals/$',
        views.VisualTestingObject.as_view(),
        name='visual_testing'),

    url(r'^analysis/(?P<pk>\d+)/zip/$',
        views.AnalysisZip.as_view(),
        name='analysis_zip'),

    url(r'^analysis/(?P<pk>\d+)/execute/$',
        views.Execute.as_view(),
        name='execute'),

    url(r'^v2/$',
        views.Dashboard2.as_view(),
        name='dashboard2'),

    url(r'^manage-data/$',
        views.ManageData.as_view(),
        name='manage_data'),

    url(r'^user-dataset/create/$',
        views.UserDatasetCreate.as_view(),
        name='user_dataset_create'),

    url(r'^user-dataset/(?P<pk>\d+)/$',
        views.UserDatasetDetail.as_view(),
        name='user_dataset'),

    url(r'^feature-list/create/$',
        views.FeatureListCreate.as_view(),
        name='feature_list_create'),

    url(r'^feature-list/(?P<pk>\d+)/$',
        views.FeatureListDetail.as_view(),
        name='feature_list'),

    url(r'^sort-vector/create/$',
        views.SortVectorCreate.as_view(),
        name='sort_vector_create'),

    url(r'^sort-vector/(?P<pk>\d+)/$',
        views.SortVectorDetail.as_view(),
        name='sort_vector'),

    url(r'^',
        views.Dashboard.as_view(),
        name='dashboard'),

]
