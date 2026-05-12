from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Enrollment, SectionExperience, SectionExperiencePurchase
from courses.serializers import CourseListSerializer

User = get_user_model()


# ── Enrollment (unchanged) ────────────────────────────────────────────────────

class EnrollmentSerializer(serializers.ModelSerializer):
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name  = serializers.SerializerMethodField()
    course        = CourseListSerializer(read_only=True)
    course_id     = serializers.UUIDField(write_only=True)

    class Meta:
        model            = Enrollment
        fields           = ('id', 'student', 'student_email', 'student_name',
                            'course', 'course_id', 'amount_paid', 'payment_status',
                            'enrolled_at', 'updated_at')
        read_only_fields = ('id', 'student', 'amount_paid', 'payment_status',
                            'enrolled_at', 'updated_at')

    def get_student_name(self, obj):
        return obj.student.get_full_name()


class EnrollmentCreateSerializer(serializers.Serializer):
    course_id = serializers.UUIDField(required=True)

    def validate_course_id(self, value):
        from courses.models import Course
        try:
            course = Course.objects.get(pk=value)
            if not course.is_approved or not course.is_published:
                raise serializers.ValidationError("Course is not available for enrollment.")
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found.")

    def validate(self, attrs):
        student = self.context['request'].user
        if Enrollment.objects.filter(student=student, course_id=attrs['course_id']).exists():
            raise serializers.ValidationError("You are already enrolled in this course.")
        return attrs

    def create(self, validated_data):
        from courses.models import Course
        course   = Course.objects.get(pk=validated_data['course_id'])
        student  = self.context['request'].user
        return Enrollment.objects.create(
            student=student, course=course,
            amount_paid=course.price, payment_status='completed'
        )


# ── Section Experience ────────────────────────────────────────────────────────

class SectionExperienceListSerializer(serializers.ModelSerializer):
    """خفيف — للقوائم وصفحة الكورس."""
    section_title    = serializers.CharField(source='section.title',   read_only=True)
    course_title     = serializers.CharField(source='section.course.title', read_only=True)
    course_id        = serializers.CharField(source='section.course.id',    read_only=True)
    instructor_name  = serializers.SerializerMethodField()
    thumbnail_url    = serializers.SerializerMethodField()
    effective_price  = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    is_purchased     = serializers.SerializerMethodField()

    class Meta:
        model  = SectionExperience
        fields = (
            'id', 'title', 'description', 'section_title',
            'course_title', 'course_id', 'instructor_name',
            'price', 'discount_price', 'effective_price', 'discount_percent',
            'thumbnail_url', 'preview_video_url',
            'status', 'is_featured', 'total_buyers',
            'is_purchased', 'created_at',
        )

    def get_instructor_name(self, obj):
        try:
            return obj.section.course.instructor.get_full_name()
        except Exception:
            return ''

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None

    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.purchases.filter(student=request.user,
                                        payment_status='completed').exists()
        return False


class SectionExperienceDetailSerializer(SectionExperienceListSerializer):
    """كامل — لصفحة التفاصيل (يشمل نسب توزيع الأرباح للمدرس والأدمن)."""
    lectures_preview = serializers.SerializerMethodField()

    class Meta(SectionExperienceListSerializer.Meta):
        fields = SectionExperienceListSerializer.Meta.fields + (
            'instructor_cut', 'college_cut', 'lectures_preview', 'updated_at',
        )

    def get_lectures_preview(self, obj):
        """أول 3 ليكتشرات كـ preview (بدون S3 keys)."""
        from courses.serializers import LectureSerializer
        lectures = obj.section.lectures.all()[:3]
        return [
            {'id': str(l.id), 'title': l.title,
             'duration_minutes': l.duration_minutes,
             'is_free_preview': l.is_free_preview}
            for l in lectures
        ]


class SectionExperienceCreateSerializer(serializers.ModelSerializer):
    """للمدرس عند إنشاء أو تعديل Section experience."""

    class Meta:
        model  = SectionExperience
        fields = (
            'id', 'section', 'title', 'description',
            'price', 'discount_price',
            'instructor_cut', 'college_cut',
            'preview_video_url', 'thumbnail',
            'status',
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        cut_i = attrs.get('instructor_cut', 70)
        cut_c = attrs.get('college_cut',    30)
        if float(cut_i) + float(cut_c) != 100:
            raise serializers.ValidationError(
                "instructor_cut + college_cut يجب أن يساوي 100%"
            )
        return attrs


# ── Purchase ──────────────────────────────────────────────────────────────────

class SectionExperiencePurchaseSerializer(serializers.ModelSerializer):
    experience   = SectionExperienceListSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model            = SectionExperiencePurchase
        fields           = ('id', 'student', 'student_name', 'experience',
                            'amount_paid', 'instructor_earn', 'college_earn',
                            'payment_status', 'purchased_at')
        read_only_fields = ('id', 'student', 'amount_paid', 'instructor_earn',
                            'college_earn', 'payment_status', 'purchased_at')

    def get_student_name(self, obj):
        return obj.student.get_full_name()


class SectionExperienceBuySerializer(serializers.Serializer):
    """لشراء Section experience — بيستقبل experience_id بس."""
    experience_id = serializers.UUIDField(required=True)

    def validate_experience_id(self, value):
        try:
            exp = SectionExperience.objects.get(pk=value, status='published')
        except SectionExperience.DoesNotExist:
            raise serializers.ValidationError("هذه التجربة غير متاحة حالياً.")
        self._experience = exp
        return value

    def validate(self, attrs):
        student = self.context['request'].user
        if SectionExperiencePurchase.objects.filter(
            student=student, experience_id=attrs['experience_id'],
            payment_status='completed'
        ).exists():
            raise serializers.ValidationError("لقد اشتريت هذه التجربة من قبل.")
        return attrs

    def create(self, validated_data):
        student    = self.context['request'].user
        experience = self._experience
        purchase   = SectionExperiencePurchase.objects.create(
            student        = student,
            experience     = experience,
            amount_paid    = experience.effective_price,
            payment_status = 'completed',
        )
        return purchase