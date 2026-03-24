from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Enrollment
from courses.serializers import CourseListSerializer

User = get_user_model()

User = get_user_model()


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model."""
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.SerializerMethodField()
    course = CourseListSerializer(read_only=True)
    course_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'student_email', 'student_name', 'course', 'course_id',
                  'amount_paid', 'payment_status', 'enrolled_at', 'updated_at')
        read_only_fields = ('id', 'student', 'amount_paid', 'payment_status',
                           'enrolled_at', 'updated_at')
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()


class EnrollmentCreateSerializer(serializers.Serializer):
    """Serializer for creating enrollment (purchase)."""
    course_id = serializers.UUIDField(required=True)
    
    def validate_course_id(self, value):
        """Validate that course exists and is approved."""
        from courses.models import Course
        try:
            course = Course.objects.get(pk=value)
            if not course.is_approved or not course.is_published:
                raise serializers.ValidationError(
                    "Course is not available for enrollment."
                )
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found.")
    
    def validate(self, attrs):
        """Check for duplicate enrollment."""
        course_id = attrs['course_id']
        student = self.context['request'].user
        
        if Enrollment.objects.filter(student=student, course_id=course_id).exists():
            raise serializers.ValidationError(
                "You are already enrolled in this course."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create enrollment after fake payment simulation."""
        course_id = validated_data['course_id']
        student = self.context['request'].user
        
        from courses.models import Course
        course = Course.objects.get(pk=course_id)
        
        # Simulate payment processing
        # In production, integrate with payment gateway here
        payment_status = 'completed'  # Fake payment always succeeds
        
        enrollment = Enrollment.objects.create(
            student=student,
            course=course,
            amount_paid=course.price,
            payment_status=payment_status
        )
        
        return enrollment
