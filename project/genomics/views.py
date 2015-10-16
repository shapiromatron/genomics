from django.views.generic import TemplateView

from plotting import heatmap


class Home(TemplateView):
    template_name = "genomics/home.html"


class BokehHeatmap(TemplateView):
    template_name = "genomics/bokeh-heatmap.html"

    def get_context_data(self):
        data = super(BokehHeatmap, self).get_context_data()
        data.update(heatmap.simple_chart())
        return data
