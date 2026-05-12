# focus/models.py
from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class FocusSession(models.Model):
    """سجل جلسة تركيز طالب أثناء مشاهدة محاضرة."""

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student             = models.ForeignKey(User, on_delete=models.CASCADE,
                                            related_name='focus_sessions')
    lecture             = models.ForeignKey('courses.Lecture', on_delete=models.CASCADE,
                                            related_name='focus_sessions',
                                            null=True, blank=True)
    total_watch_seconds = models.PositiveIntegerField(default=0)
    distracted_count    = models.PositiveIntegerField(default=0)
    distracted_times    = models.JSONField(default=list, blank=True,
                                           help_text="قائمة بأوقات وأسباب الشرود")
    focus_score         = models.PositiveIntegerField(default=100,
                                                      help_text="نسبة التركيز 0-100")
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'focus_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} — score:{self.focus_score}% — {self.created_at:%Y-%m-%d}"

    @property
    def focus_level(self):
        if self.focus_score >= 90: return 'excellent'
        if self.focus_score >= 70: return 'good'
        if self.focus_score >= 50: return 'average'
        return 'poor'