from django.conf.urls import url
from django.core.urlresolvers import reverse_lazy

from . import forms, views


urlpatterns = [

    url(r'^register/$',
        views.Register.as_view(),
        name='register'),

    url(r'^login/$',
        'django.contrib.auth.views.login',
        {'authentication_form': forms.LoginForm},
        name="login"),

    url(r'^logout/$',
        'django.contrib.auth.views.logout',
        {"next_page": reverse_lazy("home")},
        name="logout"),

    url(r'^reset-password/$',
        'django.contrib.auth.views.password_reset',
        {
            'post_reset_redirect': reverse_lazy("user:password_reset_done"),
            'password_reset_form': forms.ResetPasswordEmailForm,
        },
        name='password_reset'),

    url(r'^reset-password/sent/$',
        'django.contrib.auth.views.password_reset_done',
        name='password_reset_done'),

    url(r'^reset-password/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$',
        'django.contrib.auth.views.password_reset_confirm',
        {
            "post_reset_redirect": reverse_lazy("user:login"),
            "set_password_form": forms.ResetPasswordForm
        },
        name='password_reset_confirm'),
]
