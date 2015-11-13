from django.views.generic import TemplateView


class Home(TemplateView):
    template_name = "analysis/home.html"


class Dashboard(TemplateView):
    template_name = "analysis/dashboard.html"
