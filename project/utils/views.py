from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied


class LoginRequiredMixin(object):

    @classmethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        return login_required(view)


class OwnerOrStaff(object):

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not self.request.user.is_staff and obj.user != self.request.user:
            raise PermissionDenied()
        return obj


class AddUserToFormMixin(object):

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
