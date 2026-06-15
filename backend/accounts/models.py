from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',      True)
        extra_fields.setdefault('is_superuser',  True)
        extra_fields.setdefault('is_instructor', True)
        extra_fields.setdefault('is_approved',   True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email         = models.EmailField(unique=True, db_index=True)
    first_name    = models.CharField(max_length=150, blank=True)
    last_name     = models.CharField(max_length=150, blank=True)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)
    is_instructor = models.BooleanField(default=False)

    # ✅ موافقة الأدمن على المدرس
    is_approved = models.BooleanField(
        default=False, db_index=True,
        help_text="الأدمن يوافق على المدرس قبل ما يقدر ينشر"
    )

    magic_token = models.CharField(
    max_length=100, blank=True, default='',
    help_text="One-time login token بيتبعت للمدرس بعد الموافقة"
    )

    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    @property
    def is_student(self):
        return not self.is_instructor

    @property
    def can_publish(self):
        return self.is_staff or (self.is_instructor and self.is_approved)


class StudentProfile(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.OneToOneField(User, on_delete=models.CASCADE,
                                        related_name='student_profile',
                                        limit_choices_to={'is_instructor': False})
    avatar       = models.ImageField(upload_to='avatars/students/', null=True, blank=True)
    bio          = models.TextField(max_length=500, blank=True)
    phone_regex  = RegexValidator(regex=r'^\+?1?\d{9,15}$')
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f"Student: {self.user.email}"


class InstructorProfile(models.Model):
    TITLE_CHOICES = [
        ('dr',   'دكتور'),
        ('prof', 'أستاذ دكتور'),
        ('eng',  'مهندس'),
        ('mr',   'أستاذ'),
    ]

    id   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='instructor_profile',
                                limit_choices_to={'is_instructor': True})

    avatar         = models.ImageField(upload_to='avatars/instructors/', null=True, blank=True)
    title          = models.CharField(max_length=10, choices=TITLE_CHOICES, default='dr')
    bio            = models.TextField(max_length=2000, blank=True)
    expertise      = models.CharField(max_length=200, blank=True)
    department     = models.CharField(max_length=200, blank=True)
    university     = models.CharField(max_length=200, blank=True)
    cv_file        = models.FileField(upload_to='instructors/cvs/', null=True, blank=True)
    linkedin       = models.URLField(blank=True)
    google_scholar = models.URLField(blank=True)
    research_gate  = models.URLField(blank=True)
    website        = models.URLField(blank=True)

    years_experience = models.PositiveIntegerField(default=0)
    total_students   = models.PositiveIntegerField(default=0)

    phone_regex  = RegexValidator(regex=r'^\+?1?\d{9,15}$')
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    office_hours = models.CharField(max_length=200, blank=True)

    is_featured  = models.BooleanField(default=False, db_index=True)
    show_cv      = models.BooleanField(default=True)
    show_contact = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'instructor_profiles'
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return f"{self.get_title_display()} {self.user.get_full_name()}"

    @property
    def display_name(self):
        return f"{self.get_title_display()} {self.user.get_full_name()}"

    @property
    def course_count(self):
        return self.user.courses.filter(is_published=True, is_approved=True).count()