from django.contrib import admin

from . import models


class UserAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'email',
        'is_active', 'is_staff', 'is_superuser',
        'date_joined', 'last_login',
    )
    list_filter = (
        'is_staff', 'is_superuser',
    )
    search_fields = (
        'email',
    )


admin.site.register(models.User, UserAdmin)
