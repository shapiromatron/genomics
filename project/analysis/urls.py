from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()


urlpatterns = [

    url(r'^api/',
        include(router.urls, namespace="api")),

    url(r'^$',
        views.Dashboard.as_view(),
        name='dashboard'),
]
