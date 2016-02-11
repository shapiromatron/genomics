from rest_framework import authentication, permissions, pagination
from rest_framework import renderers


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 500
    page_size_query_param = 'page_size'
    max_page_size = 1000


class NoPagination(pagination.PageNumberPagination):
    page_size = None


class SiteMixin(object):
    """
    Default settings for view authentication, permissions, filtering
    and pagination.
    """
    pagination_class = StandardResultsSetPagination
    authentication_classes = (
        authentication.BasicAuthentication,
        authentication.SessionAuthentication,
    )
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
    )


class OwnedButSharablePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS and obj.public:
            return True

        if request.user.is_anonymous():
            return False

        return obj.owner == request.user


class OwnedButShareableMixin(SiteMixin):
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        OwnedButSharablePermission,
    )


class PlainTextRenderer(renderers.BaseRenderer):
    media_type = 'text/plain'
    format = 'txt'

    def render(self, data, media_type=None, renderer_context=None):
        return data.encode(self.charset)
