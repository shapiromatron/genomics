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
        permissions.IsAuthenticated,
    )
    paginate_by = 25
    paginate_by_param = 'page_size'
    max_paginate_by = 1000
