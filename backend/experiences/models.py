from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Experience(models.Model):
    STATUS_CHOICES = [
        ('draft',     'مسودة'),
        ('published', 'منشور'),
    ]

    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_experiences',
        limit_choices_to={'is_instructor': True}
    )
    section = models.ForeignKey(
        'courses.Section',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='experiences'
    )

    title             = models.CharField(max_length=255, db_index=True)
    description       = models.TextField(blank=True)
    image             = models.ImageField(upload_to='experiences/images/', null=True, blank=True)
    preview_video_url = models.URLField(null=True, blank=True,
                                        help_text="فيديو مجاني — يشوفه الكل")
    content_video_url = models.URLField(null=True, blank=True,
                                        help_text="الفيديو الكامل — للمشترين فقط")

    price          = models.DecimalField(max_digits=10, decimal_places=2,
                                         validators=[MinValueValidator(0)], default=0.00)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2,
                                         validators=[MinValueValidator(0)],
                                         null=True, blank=True,
                                         help_text="اتركه فارغاً لو مفيش خصم")

    instructor_cut = models.PositiveIntegerField(default=70)
    college_cut    = models.PositiveIntegerField(default=30)

    is_approved  = models.BooleanField(default=False, db_index=True)
    status       = models.CharField(max_length=10, choices=STATUS_CHOICES,
                                    default='draft', db_index=True)
    is_featured  = models.BooleanField(default=False)
    total_buyers = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'experiences'
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['is_approved', 'status']),
            models.Index(fields=['instructor', 'is_approved']),
        ]

    def __str__(self):
        return self.title

    @property
    def effective_price(self):
        if self.discount_price is not None and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def discount_percent(self):
        if self.discount_price is not None and self.price > 0 and self.discount_price < self.price:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0

    @property
    def is_available(self):
        return self.is_approved and self.status == 'published'


class ExperiencePurchase(models.Model):
    student    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='experience_enrollments'
    )
    experience = models.ForeignKey(
        Experience,
        on_delete=models.CASCADE,
        related_name='purchases'
    )
    amount_paid     = models.DecimalField(max_digits=10, decimal_places=2)
    instructor_earn = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    college_earn    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purchased_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'experience_purchases'
        ordering        = ['-purchased_at']
        unique_together = [['student', 'experience']]

    def __str__(self):
        return f"{self.student.email} — {self.experience.title}"

    def save(self, *args, **kwargs):
        if not self.pk:
            price = float(self.amount_paid)
            self.instructor_earn = round(price * self.experience.instructor_cut / 100, 2)
            self.college_earn    = round(price * self.experience.college_cut    / 100, 2)
        super().save(*args, **kwargs)
        Experience.objects.filter(pk=self.experience_id).update(
            total_buyers=models.F('total_buyers') + 1
        )