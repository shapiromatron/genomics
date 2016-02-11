from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect, JsonResponse
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.views.generic.edit import BaseUpdateView

from utils.views import OwnerOrStaff
from . import models, tasks


class Home(TemplateView):
    template_name = 'analysis/home.html'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return HttpResponseRedirect(reverse_lazy('analysis:dashboard'))
        return super(Home, self).get(request, *args, **kwargs)


class Dashboard(TemplateView):
    template_name = 'analysis/dashboard.html'

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class Execute(OwnerOrStaff, BaseUpdateView):
    http_method_names = ('post', )
    model = models.Analysis

    def post(self, context, **response_kwargs):
        obj = self.get_object()
        return JsonResponse({'run': True})


class CeleryTester(Home):
    def get(self, request, *args, **kwargs):
        tasks.debug_task.delay()
        return super().get(request, *args, **kwargs)
