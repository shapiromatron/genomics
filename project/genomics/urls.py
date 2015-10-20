from django.conf.urls import include, url

from . import views


urlpatterns = [


    url(r'^bokeh-plot/$',
        views.BokehPlot.as_view(),
        name='bokeh_plot'),

    url(r'^result/(?P<pk>\d+)/$',
        views.ResultDetail.as_view(),
        name="result_detail")

]
