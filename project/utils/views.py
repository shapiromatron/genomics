from django.contrib.auth.decorators import login_required
from django import http


class LoginRequiredMixin(object):

    @classmethod
    def as_view(cls, **initkwargs):
        view = super(LoginRequiredMixin, cls).as_view(**initkwargs)
        return login_required(view)


class OwnerOrStaff(object):

    def get_object(self, queryset=None):
        obj = super(OwnerOrStaff, self).get_object(queryset)
        if not self.request.user.is_staff and obj.user != self.request.user:
            raise http.HttpResponseForbidden()
        return obj


class AddUserToFormMixin(object):

    def get_form_kwargs(self):
        kwargs = super(AddUserToFormMixin, self).get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
