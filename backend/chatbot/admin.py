from django.contrib import admin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model      = ChatMessage
    extra      = 0
    readonly_fields = ['id', 'role', 'content', 'created_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display   = ['user', 'title', 'message_count', 'created_at', 'updated_at']
    list_filter    = ['created_at']
    search_fields  = ['user__email', 'title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines        = [ChatMessageInline]
    ordering       = ['-updated_at']

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'عدد الرسائل'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = ['session', 'role', 'short_content', 'created_at']
    list_filter   = ['role', 'created_at']
    search_fields = ['content', 'session__user__email']
    readonly_fields = ['id', 'created_at']
    ordering      = ['-created_at']

    def short_content(self, obj):
        return obj.content[:80]
    short_content.short_description = 'محتوى الرسالة'