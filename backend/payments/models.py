from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import uuid

User = get_user_model()


class Enrollment(models.Model):
    """Enrollment model linking students to courses."""
    PAYMENT_STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
        ('refunded',  'Refunded'),
    ]

    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments',
                                       limit_choices_to={'is_instructor': False})
    course         = models.ForeignKey('courses.Course', on_delete=models.CASCADE,
                                       related_name='enrollments')
    amount_paid    = models.DecimalField(max_digits=10, decimal_places=2,
                                         validators=[MinValueValidator(0)], default=0.00)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES,
                                      default='completed')
    enrolled_at    = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'enrollments'
        ordering        = ['-enrolled_at']
        unique_together = [['student', 'course']]
        indexes         = [
            models.Index(fields=['student', 'enrolled_at']),
            models.Index(fields=['course',  'enrolled_at']),
        ]

    def __str__(self):
        return f"{self.student.email} enrolled in {self.course.title}"

    def save(self, *args, **kwargs):
        if not self.amount_paid:
            self.amount_paid = self.course.price
        super().save(*args, **kwargs)


# ══════════════════════════════════════════════════════════════════════════════
#  Section Experience  —  Section experience مدفوعة
# ══════════════════════════════════════════════════════════════════════════════

class SectionExperience(models.Model):
    """
    Section experience قابلة للشراء بشكل منفصل عن الكورس.
    مثال: طالب فاته سكشن معين يشتريه ويشوف كيف اتحلّت المسائل.
    """
    STATUS_CHOICES = [
        ('draft',     'مسودة'),
        ('published', 'منشور'),
        ('archived',  'مؤرشف'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section     = models.OneToOneField('courses.Section', on_delete=models.CASCADE,
                                       related_name='experience')
    title       = models.CharField(max_length=300)
    description = models.TextField(blank=True,
                                   help_text="شرح مختصر لمحتوى التجربة وما سيتعلمه الطالب")

    # ── Pricing ───────────────────────────────────────────────────────────────
    price           = models.DecimalField(max_digits=8, decimal_places=2,
                                          validators=[MinValueValidator(0)], default=0)
    discount_price  = models.DecimalField(max_digits=8, decimal_places=2,
                                          validators=[MinValueValidator(0)],
                                          null=True, blank=True)

    # ── Revenue split ─────────────────────────────────────────────────────────
    instructor_cut  = models.DecimalField(max_digits=5, decimal_places=2, default=70.00,
                                          help_text="نسبة المدرس % (مثال: 70)")
    college_cut     = models.DecimalField(max_digits=5, decimal_places=2, default=30.00,
                                          help_text="نسبة الكلية/المنصة % (مثال: 30)")

    # ── Media ─────────────────────────────────────────────────────────────────
    preview_video_url = models.URLField(blank=True,
                                        help_text="رابط فيديو preview مجاني (اختياري)")
    thumbnail         = models.ImageField(upload_to='experiences/thumbnails/',
                                          null=True, blank=True)

    # ── Meta ──────────────────────────────────────────────────────────────────
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES,
                                    default='draft', db_index=True)
    is_featured  = models.BooleanField(default=False)
    total_buyers = models.PositiveIntegerField(default=0)   # cached count
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'section_experiences'
        ordering = ['-created_at']

    def __str__(self):
        return f"تجربة: {self.title}"

    @property
    def effective_price(self):
        if self.discount_price is not None and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def discount_percent(self):
        if self.discount_price and self.price > 0 and self.discount_price < self.price:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0

    @property
    def instructor(self):
        return self.section.course.instructor


class SectionExperiencePurchase(models.Model):
    """سجل كل عملية شراء لSection experience."""
    PAYMENT_STATUS_CHOICES = [
        ('pending',   'قيد المعالجة'),
        ('completed', 'مكتمل'),
        ('failed',    'فشل'),
        ('refunded',  'مُسترد'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student         = models.ForeignKey(User, on_delete=models.CASCADE,
                                        related_name='experience_purchases',
                                        limit_choices_to={'is_instructor': False})
    experience      = models.ForeignKey(SectionExperience, on_delete=models.CASCADE,
                                        related_name='purchases')
    amount_paid     = models.DecimalField(max_digits=8, decimal_places=2,
                                          validators=[MinValueValidator(0)])
    instructor_earn = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    college_earn    = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_status  = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES,
                                       default='completed')
    purchased_at    = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'section_experience_purchases'
        ordering        = ['-purchased_at']
        unique_together = [['student', 'experience']]

    def __str__(self):
        return f"{self.student.email} — {self.experience.title}"

    def save(self, *args, **kwargs):
        # احسب توزيع الأرباح تلقائياً
        if self.amount_paid and not self.instructor_earn:
            price = float(self.amount_paid)
            exp   = self.experience
            self.instructor_earn = round(price * float(exp.instructor_cut) / 100, 2)
            self.college_earn    = round(price * float(exp.college_cut)    / 100, 2)
        super().save(*args, **kwargs)
        # حدّث الـ cached count
        SectionExperience.objects.filter(pk=self.experience_id).update(
            total_buyers=models.F('total_buyers') + 1
        )