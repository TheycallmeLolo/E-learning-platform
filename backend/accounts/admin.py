from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, InstructorProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('email', 'first_name', 'last_name', 'is_instructor',
                     'is_approved', 'is_staff', 'is_active', 'date_joined')
    list_filter   = ('is_instructor', 'is_approved', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering      = ('-date_joined',)

    fieldsets = (
        (None,             {'fields': ('email', 'password')}),
        ('Personal Info',  {'fields': ('first_name', 'last_name')}),
        ('Permissions',    {'fields': ('is_instructor', 'is_approved', 'is_active',
                                      'is_staff', 'is_superuser',
                                      'groups', 'user_permissions')}),
        # ✅ date_joined هنا read_only فمش بيتحط في fieldsets
    )
    readonly_fields = ('date_joined', 'last_login')  # ✅ عرضهم بس بدون تعديل

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields' : ('email', 'password1', 'password2', 'is_instructor'),
        }),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'phone_number', 'created_at')
    list_filter   = ('created_at',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)


@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'expertise', 'website', 'created_at')
    list_filter   = ('created_at',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'expertise')
    raw_id_fields = ('user',)