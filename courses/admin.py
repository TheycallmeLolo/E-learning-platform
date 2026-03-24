from django.contrib import admin
from .models import Course, Section, Lecture


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin configuration for Course model."""
    list_display = ('title', 'instructor', 'price', 'is_approved', 'is_published', 'created_at')
    list_filter = ('is_approved', 'is_published', 'created_at')
    search_fields = ('title', 'description', 'instructor__email')
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ('instructor',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'instructor')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
        ('Status', {
            'fields': ('is_approved', 'is_published')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_courses', 'reject_courses']
    
    def approve_courses(self, request, queryset):
        """Approve selected courses."""
        updated = queryset.update(is_approved=True, is_published=True)
        self.message_user(request, f'{updated} courses approved and published.')
    approve_courses.short_description = "Approve and publish selected courses"
    
    def reject_courses(self, request, queryset):
        """Reject selected courses."""
        updated = queryset.update(is_approved=False, is_published=False)
        self.message_user(request, f'{updated} courses rejected.')
    reject_courses.short_description = "Reject selected courses"


class LectureInline(admin.TabularInline):
    """Inline admin for Lecture model."""
    model = Lecture
    extra = 1
    ordering = ('order',)


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    """Admin configuration for Section model."""
    list_display = ('title', 'course', 'order', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'course__title')
    raw_id_fields = ('course',)
    inlines = [LectureInline]
    ordering = ('course', 'order')


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    """Admin configuration for Lecture model."""
    list_display = ('title', 'section', 'order', 'duration_minutes', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'section__title', 'section__course__title')
    raw_id_fields = ('section',)
    ordering = ('section', 'order')
