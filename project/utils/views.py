from django.core.exceptions import PermissionDenied


class OwnerOrStaff(object):

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not self.request.user.is_staff and obj.owner != self.request.user:
            raise PermissionDenied()
        return obj


class AddUserToFormMixin(object):

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['owner'] = self.request.user
        return kwargs
