from django.views.generic import TemplateView, DetailView, ListView

from . import models

from plotting import scatter


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


class ResultDetail2(DetailView):
    model = models.Result
    template_name = 'genomics/result_detail2.html'
