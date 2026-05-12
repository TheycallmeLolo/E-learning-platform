from django.contrib import admin
from .models import Experience, ExperiencePurchase


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display  = ('title', 'instructor', 'price', 'is_approved', 'status',
                     'total_buyers', 'created_at')
    list_filter   = ('is_approved', 'status', 'is_featured', 'created_at')
    search_fields = ('title', 'description', 'instructor__email')
    raw_id_fields = ('instructor', 'section')
    readonly_fields = ('total_buyers', 'created_at', 'updated_at')

    fieldsets = (
        ('المعلومات الأساسية', {
            'fields': ('title', 'description', 'instructor', 'section')
        }),
        ('الميديا', {
            'fields': ('image', 'preview_video_url', 'content_video_url')
        }),
        ('التسعير', {
            'fields': ('price', 'discount_price', 'instructor_cut', 'college_cut')
        }),
        ('الحالة', {
            'fields': ('is_approved', 'status', 'is_featured', 'total_buyers')
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['approve_experiences', 'reject_experiences']

    def approve_experiences(self, request, queryset):
        updated = queryset.update(is_approved=True, status='published')
        self.message_user(request, f'{updated} تجربة تم اعتمادها ونشرها.')
    approve_experiences.short_description = "اعتماد ونشر التجارب المحددة"

    def reject_experiences(self, request, queryset):
        updated = queryset.update(is_approved=False, status='draft')
        self.message_user(request, f'{updated} تجربة تم رفضها.')
    reject_experiences.short_description = "رفض التجارب المحددة"


@admin.register(ExperiencePurchase)
class ExperiencePurchaseAdmin(admin.ModelAdmin):
    list_display  = ('student', 'experience', 'amount_paid',
                     'instructor_earn', 'college_earn', 'purchased_at')
    list_filter   = ('purchased_at',)
    search_fields = ('student__email', 'experience__title')
    raw_id_fields = ('student', 'experience')
    readonly_fields = ('instructor_earn', 'college_earn', 'purchased_at')