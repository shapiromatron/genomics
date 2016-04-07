from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import HttpResponse
from django.core.exceptions import PermissionDenied
from django.views.generic import TemplateView, UpdateView, DetailView

from utils.views import OwnerOrStaff
from . import models, tasks


class Home(TemplateView):
    template_name = 'analysis/home.html'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return HttpResponseRedirect(reverse_lazy('analysis:dashboard'))
        return super(Home, self).get(request, *args, **kwargs)


class Dashboard(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/dashboard.html'


class AnalysisReadOnlyMixin(object):

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.user_can_view(self.request.user):
            raise PermissionDenied()
        return obj


class VisualTestingObject(AnalysisReadOnlyMixin, DetailView):
    """
    Temporary view used for visual testing
    """
    model = models.Analysis
    template_name = 'analysis/visual_testing.html'


class Execute(OwnerOrStaff, UpdateView):
    http_method_names = ('post', )
    model = models.Analysis

    def post(self, context, **response_kwargs):
        obj = self.get_object()
        obj.execute()
        return JsonResponse({'run': True})


class AnalysisZip(AnalysisReadOnlyMixin, DetailView):
    model = models.Analysis

    def get(self, context, **response_kwargs):
        obj = self.get_object()
        zip_ = obj.create_zip()
        zip_.seek(0)
        response = HttpResponse(zip_, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="{}.zip"'.format(obj)
        return response


class CeleryTester(Home):
    def get(self, request, *args, **kwargs):
        tasks.debug_task.delay()
        return super().get(request, *args, **kwargs)
