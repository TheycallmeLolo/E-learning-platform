from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Section, Lecture

User = get_user_model()


class LectureSerializer(serializers.ModelSerializer):
    """Serializer for Lecture model."""
    course = serializers.SerializerMethodField()
    is_approved = serializers.BooleanField(read_only=True)

    class Meta:
        model = Lecture
        fields = (
            'id', 'section', 'title', 'description',
            # video
            'video_type', 'video_url', 's3_key', 'video_status', 'is_approved',
            # meta
            'duration_minutes', 'order', 'is_free_preview',
            'course', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'video_status', 'created_at', 'updated_at')

    def get_course(self, obj):
        return {
            'id': str(obj.course.id),
            'title': obj.course.title,
            'slug': obj.course.slug,
        }

    def validate(self, data):
        video_type = data.get('video_type', 'upload')
        video_url = data.get('video_url', '')
        s3_key = data.get('s3_key', '')

        if video_type in ('youtube', 'vimeo') and not video_url:
            raise serializers.ValidationError(
                {'video_url': 'video_url is required for YouTube / Vimeo lectures.'}
            )
        if video_type == 'upload' and not s3_key:
            raise serializers.ValidationError(
                {'s3_key': 's3_key is required for uploaded lectures. Upload the file first.'}
            )
        return data


class SectionSerializer(serializers.ModelSerializer):
    """Serializer for Section model."""
    lectures = LectureSerializer(many=True, read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Section
        fields = ('id', 'course', 'course_title', 'title', 'description',
                  'order', 'lectures', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for Course list view."""
    instructor_name = serializers.SerializerMethodField()
    instructor_email = serializers.CharField(source='instructor.email', read_only=True)
    image_url = serializers.SerializerMethodField()
    total_sections = serializers.IntegerField(read_only=True)
    total_lectures = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'description', 'price', 'image', 'image_url',
                  'instructor', 'instructor_name', 'instructor_email',
                  'is_approved', 'is_published', 'total_sections', 'total_lectures',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'is_approved', 'is_published',
                            'created_at', 'updated_at', 'instructor')

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name()

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer for Course detail view."""
    instructor_name = serializers.SerializerMethodField()
    instructor_email = serializers.CharField(source='instructor.email', read_only=True)
    image_url = serializers.SerializerMethodField()
    sections = SectionSerializer(many=True, read_only=True)
    total_sections = serializers.IntegerField(read_only=True)
    total_lectures = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'description', 'price', 'image', 'image_url',
                  'instructor', 'instructor_name', 'instructor_email',
                  'is_approved', 'is_published', 'sections',
                  'total_sections', 'total_lectures', 'is_enrolled',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'is_approved', 'is_published',
                            'created_at', 'updated_at', 'is_enrolled', 'instructor')

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name()

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False


class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Course."""
    instructor_email = serializers.CharField(source='instructor.email', read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'slug', 'description', 'price', 'image',
                  'instructor', 'instructor_email', 'is_approved', 'is_published',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'is_approved', 'is_published',
                            'created_at', 'updated_at', 'instructor')

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
