from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """Admin configuration for Enrollment model."""
    list_display = ('student', 'course', 'amount_paid', 'payment_status', 'enrolled_at')
    list_filter = ('payment_status', 'enrolled_at')
    search_fields = ('student__email', 'course__title')
    raw_id_fields = ('student', 'course')
    readonly_fields = ('enrolled_at', 'updated_at')
    
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('student', 'course', 'amount_paid', 'payment_status')
        }),
        ('Timestamps', {
            'fields': ('enrolled_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
