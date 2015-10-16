from django.conf.urls import url

from . import views


urlpatterns = [

    url(r'^bokeh-heatmap/$',
        views.BokehHeatmap.as_view(),
        name='bokeh_heatmap'),

]
