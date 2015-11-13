from django.contrib.auth.models import AnonymousUser
from rest_framework import authentication, permissions


class SiteMixin(object):
    """
    Default settings for view authentication, permissions, filtering
    and pagination.
    """
    authentication_classes = (
        authentication.BasicAuthentication,
        authentication.SessionAuthentication,
    )
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
    )
    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 1000


class OwnedButSharablePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS and obj.public:
            return True

        if request.user is not AnonymousUser:
            return obj.owner == request.user

        return False


class OwnedButShareableMixin(SiteMixin):
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        OwnedButSharablePermission,
    )
