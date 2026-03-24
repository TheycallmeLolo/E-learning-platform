from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import uuid

User = get_user_model()


class Enrollment(models.Model):
    """Enrollment model linking students to courses."""
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'is_instructor': False}
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        default=0.00
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='completed'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'enrollments'
        ordering = ['-enrolled_at']
        unique_together = [['student', 'course']]
        indexes = [
            models.Index(fields=['student', 'enrolled_at']),
            models.Index(fields=['course', 'enrolled_at']),
        ]
    
    def __str__(self):
        return f"{self.student.email} enrolled in {self.course.title}"
    
    def save(self, *args, **kwargs):
        # Set amount_paid to course price if not set
        if not self.amount_paid:
            self.amount_paid = self.course.price
        super().save(*args, **kwargs)
