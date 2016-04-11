from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import HttpResponse
from django.core.exceptions import PermissionDenied
from django.views.generic import TemplateView, CreateView, UpdateView, DetailView, DeleteView

from utils.views import OwnerOrStaff, AddUserToFormMixin
from . import models, forms, tasks


class Home(TemplateView):
    template_name = 'analysis/home.html'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return HttpResponseRedirect(reverse_lazy('analysis:dashboard'))
        return super(Home, self).get(request, *args, **kwargs)


class DashboardOld(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/dashboard_old.html'


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


# Dashboard crud views
class Dashboard(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['analysis_running'] = models.Analysis.is_running(self.request.user)
        context['analysis_complete'] = models.Analysis.is_complete(self.request.user)
        return context


class ManageData(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/manage_data.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['feature_lists'] = models.FeatureList.objects.filter(owner=self.request.user)
        context['sort_vectors'] = models.SortVector.objects.filter(owner=self.request.user)
        context['user_datasets'] = models.UserDataset.objects.filter(owner=self.request.user)
        return context


# User dataset
class UserDatasetDetail(OwnerOrStaff, DetailView):
    model = models.UserDataset


class UserDatasetCreate(AddUserToFormMixin, LoginRequiredMixin, CreateView):
    model = models.UserDataset
    form_class = forms.UserDatasetForm
    success_url = reverse_lazy('analysis:manage_data')


class UserDatasetUpdate(OwnerOrStaff, UpdateView):
    model = models.UserDataset
    form_class = forms.UserDatasetForm
    success_url = reverse_lazy('analysis:manage_data')


class UserDatasetDelete(OwnerOrStaff, DeleteView):
    model = models.UserDataset
    success_url = reverse_lazy('analysis:manage_data')


# Feature list
class FeatureListDetail(OwnerOrStaff, DetailView):
    model = models.FeatureList


class FeatureListCreate(AddUserToFormMixin, LoginRequiredMixin, CreateView):
    model = models.FeatureList
    form_class = forms.FeatureListForm
    success_url = reverse_lazy('analysis:manage_data')


class FeatureListUpdate(OwnerOrStaff, UpdateView):
    model = models.FeatureList
    form_class = forms.FeatureListForm
    success_url = reverse_lazy('analysis:manage_data')


class FeatureListDelete(OwnerOrStaff, DeleteView):
    model = models.FeatureList
    success_url = reverse_lazy('analysis:manage_data')


# Sort vector
class SortVectorDetail(OwnerOrStaff, DetailView):
    model = models.SortVector


class SortVectorCreate(AddUserToFormMixin, LoginRequiredMixin, CreateView):
    model = models.SortVector
    form_class = forms.SortVectorForm
    success_url = reverse_lazy('analysis:manage_data')


class SortVectorUpdate(OwnerOrStaff, UpdateView):
    model = models.SortVector
    form_class = forms.SortVectorForm
    success_url = reverse_lazy('analysis:manage_data')


class SortVectorDelete(OwnerOrStaff, DeleteView):
    model = models.SortVector
    success_url = reverse_lazy('analysis:manage_data')


# Analysis
class AnalysisDetail(OwnerOrStaff, DetailView):
    model = models.Analysis


class AnalysisCreate(AddUserToFormMixin, LoginRequiredMixin, CreateView):
    model = models.Analysis
    form_class = forms.AnalysisForm
    success_url = reverse_lazy('analysis:dashboard')


class AnalysisUpdate(OwnerOrStaff, UpdateView):
    model = models.Analysis
    form_class = forms.AnalysisForm


class AnalysisDelete(OwnerOrStaff, DeleteView):
    model = models.Analysis
    success_url = reverse_lazy('analysis:dashboard')
