from django.views.generic import TemplateView, DetailView, ListView

from . import models

from plotting import scatter, heatmap


class ResultList(ListView):
    model = models.Result


class BokehPlot(TemplateView):
    template_name = "genomics/plot.html"

    def get_context_data(self):
        data = super(BokehPlot, self).get_context_data()
        data.update(scatter.simple_chart())
        return data


class ResultDetail(DetailView):
    model = models.Result

    def get_context_data(self, **kwargs):
        data = super(ResultDetail, self).get_context_data(**kwargs)
        return data
