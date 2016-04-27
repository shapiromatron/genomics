from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import HttpResponse, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.views.generic import TemplateView, CreateView, UpdateView, \
        DetailView, DeleteView, ListView

from utils.views import OwnerOrStaff, AddUserToFormMixin
from . import models, forms, tasks


class Home(TemplateView):
    template_name = 'analysis/home.html'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return HttpResponseRedirect(reverse_lazy('analysis:dashboard'))
        return super(Home, self).get(request, *args, **kwargs)


class CeleryTester(Home):
    def get(self, request, *args, **kwargs):
        tasks.debug_task.delay()
        return super().get(request, *args, **kwargs)


# Dashboard CRUD views
class Dashboard(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['analysis_running'] = models.Analysis.running(self.request.user)
        context['analysis_complete'] = models.Analysis.complete(self.request.user)
        return context


class ManageData(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/manage_data.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['feature_lists'] = models.FeatureList.objects.filter(owner=self.request.user)
        context['sort_vectors'] = models.SortVector.objects.filter(owner=self.request.user)
        context['user_datasets'] = models.UserDataset.objects.filter(owner=self.request.user)
        return context


# User dataset CRUD
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


# User dataset CRUD
class DatasetDownloadRetry(OwnerOrStaff, DetailView):
    model = models.UserDataset

    def render_to_response(self, context, **response_kwargs):
        # try to download-dataset again, then redirect to UserDataset detail
        dd = get_object_or_404(
            models.DatasetDownload,
            id=int(self.kwargs['dd_pk']),
            owner=self.request.user
        )
        tasks.download_dataset.delay(dd.id)
        return HttpResponseRedirect(self.object.get_absolute_url())


# Feature list CRUD
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


# Sort vector CRUD
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


# Analysis CRUD
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


# analysis non-CRUD
class AnalysisReadOnlyMixin(object):

    # TODO - standardize permissions checks - use this or OwnerOrStaff mixin?
    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.user_can_view(self.request.user):
            raise PermissionDenied()
        return obj


class AnalysisVisual(AnalysisReadOnlyMixin, DetailView):
    """
    Temporary view used for visual testing
    """
    model = models.Analysis
    template_name = 'analysis/analysis_visual.html'


class AnalysisExecute(OwnerOrStaff, DetailView):
    model = models.Analysis
    template_name = 'analysis/analysis_execute.html'

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()

        if request.is_ajax():
            complete = self.object.get_execution_status()
            return JsonResponse({'fractionComplete': complete})

        self.object.execute()
        return super().get(request, *args, **kwargs)


class AnalysisZip(AnalysisReadOnlyMixin, DetailView):
    model = models.Analysis

    def get(self, context, **response_kwargs):
        obj = self.get_object()
        zip_ = obj.create_zip()
        zip_.seek(0)
        response = HttpResponse(zip_, content_type='application/zip')
        response['Content-Disposition'] = 'attachment; filename="{}.zip"'.format(obj)
        return response
