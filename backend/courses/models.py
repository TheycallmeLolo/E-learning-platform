from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils.text import slugify
import uuid

User = get_user_model()


class Course(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instructor  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses',
                                    limit_choices_to={'is_instructor': True})
    title       = models.CharField(max_length=200, db_index=True)
    slug        = models.SlugField(max_length=200, unique=True, db_index=True)
    description = models.TextField()

    # ── Pricing ───────────────────────────────────────────────────────────────
    price          = models.DecimalField(max_digits=10, decimal_places=2,
                                         validators=[MinValueValidator(0)], default=0.00)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2,
                                          validators=[MinValueValidator(0)],
                                          null=True, blank=True,
                                          help_text="سعر بعد التخفيض – اتركه فارغاً لو مفيش تخفيض")
    # ─────────────────────────────────────────────────────────────────────────

    image        = models.ImageField(upload_to='courses/images/', null=True, blank=True)
    is_approved  = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=False, db_index=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['is_approved', 'is_published']),
            models.Index(fields=['instructor', 'is_approved']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            original_slug = self.slug
            counter = 1
            while Course.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        """السعر الفعلي بعد التخفيض لو موجود."""
        if self.discount_price is not None and self.discount_price < self.price:
            return self.discount_price
        return self.price

    @property
    def discount_percent(self):
        """نسبة التخفيض كـ integer."""
        if self.discount_price is not None and self.price > 0 and self.discount_price < self.price:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0

    @property
    def total_lectures(self):
        return sum(s.lectures.count() for s in self.sections.all())

    @property
    def total_sections(self):
        return self.sections.count()


class Section(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order       = models.PositiveIntegerField(default=0, db_index=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table       = 'sections'
        ordering       = ['order', 'created_at']
        unique_together = [['course', 'order']]

    def __str__(self):
        return f"{self.course.title} – {self.title}"


class Lecture(models.Model):
    VIDEO_TYPE_CHOICES   = [('upload','S3'),('youtube','YouTube'),('vimeo','Vimeo')]
    VIDEO_STATUS_CHOICES = [('pending','Pending'),('approved','Approved'),('rejected','Rejected')]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section     = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lectures')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_type  = models.CharField(max_length=10, choices=VIDEO_TYPE_CHOICES,
                                    default='upload', db_index=True)
    video_url   = models.URLField(blank=True)
    s3_key      = models.CharField(max_length=500, blank=True)
    video_status= models.CharField(max_length=10, choices=VIDEO_STATUS_CHOICES,
                                    default='pending', db_index=True)
    duration_minutes = models.PositiveIntegerField(default=0)
    order       = models.PositiveIntegerField(default=0, db_index=True)
    is_free_preview = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table       = 'lectures'
        ordering       = ['order', 'created_at']
        unique_together = [['section', 'order']]

    def __str__(self):
        return f"{self.section.title} – {self.title}"

    @property
    def course(self):
        return self.section.course

    @property
    def is_approved(self):
        return self.video_status == 'approved'