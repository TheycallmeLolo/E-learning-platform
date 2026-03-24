from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class ChatSession(models.Model):
    """جلسة محادثة كاملة لكل يوزر"""
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title      = models.CharField(max_length=200, blank=True, help_text="أول رسالة من المحادثة")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} — {self.title or 'محادثة بدون عنوان'}"

    def save(self, *args, **kwargs):
        # لو مفيش عنوان، خد أول رسالة من الـ messages
        if not self.title:
            first_msg = self.messages.filter(role='user').first()
            if first_msg:
                self.title = first_msg.content[:80]
        super().save(*args, **kwargs)


class ChatMessage(models.Model):
    """رسالة واحدة داخل الجلسة"""
    ROLE_CHOICES = [
        ('user',      'User'),
        ('assistant', 'Assistant'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session    = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role       = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"