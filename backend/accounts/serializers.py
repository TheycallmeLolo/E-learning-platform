from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, StudentProfile, InstructorProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password  = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')

    class Meta:
        model  = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'is_instructor')
        extra_kwargs = {
            'first_name':    {'required': False},
            'last_name':     {'required': False},
            'is_instructor': {'required': False, 'default': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password      = validated_data.pop('password')
        is_instructor = validated_data.pop('is_instructor', False)

        user = User.objects.create_user(
            password=password, is_instructor=is_instructor, is_active=True, **validated_data
        )
        if is_instructor:
            InstructorProfile.objects.create(user=user)
        else:
            StudentProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model        = User
        fields       = ('id', 'email', 'first_name', 'last_name', 'full_name',
                        'is_instructor', 'date_joined', 'is_active', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_active')


class StudentProfileSerializer(serializers.ModelSerializer):
    user       = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model            = StudentProfile
        fields           = ('id', 'user', 'avatar', 'avatar_url', 'bio', 'phone_number',
                            'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


# ── Instructor ─────────────────────────────────────────────────────────────────


# ─────────────────────────────────────────────────────────────
# 🟢 Instructor Serializers (محدّث لدعم الـ CV بشكل صريح)
# ─────────────────────────────────────────────────────────────
class InstructorProfileSerializer(serializers.ModelSerializer):
    user         = UserSerializer(read_only=True)
    avatar_url   = serializers.SerializerMethodField()
    cv_url       = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    course_count = serializers.IntegerField(read_only=True)
    title_label  = serializers.CharField(source='get_title_display', read_only=True)

    class Meta:
        model  = InstructorProfile
        fields = (
            'id', 'user', 'display_name', 'title', 'title_label',
            'avatar', 'avatar_url',
            'bio', 'expertise', 'department', 'university',
            'cv_file', 'cv_url', 'show_cv',
            'linkedin', 'google_scholar', 'research_gate', 'website',
            'years_experience', 'total_students', 'course_count',
            'phone_number', 'show_contact', 'office_hours',
            'is_featured', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'display_name', 'course_count', 'title_label')
        extra_kwargs = {
            'cv_file': {'required': False, 'allow_null': True}, # ✅ ضروري لرفع الـ CV
            'avatar':  {'required': False, 'allow_null': True},
        }

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None

    def get_cv_url(self, obj):
        if not obj.cv_file:
            return None
        # صاحب البروفايل والأدمن يشوفوا دايماً
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user == obj.user or request.user.is_staff:
                return request.build_absolute_uri(obj.cv_file.url)
        # غير كده: بس لو show_cv = True
        if obj.show_cv:
            return request.build_absolute_uri(obj.cv_file.url) if request else obj.cv_file.url
        return None


class InstructorCardSerializer(serializers.ModelSerializer):
    user         = UserSerializer(read_only=True)
    avatar_url   = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    course_count = serializers.IntegerField(read_only=True)
    title_label  = serializers.CharField(source='get_title_display', read_only=True)

    class Meta:
        model  = InstructorProfile
        fields = (
            'id', 'user', 'display_name', 'title_label',
            'avatar_url', 'expertise', 'department', 'university',
            'years_experience', 'course_count', 'is_featured',
        )

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


# ── User Detail ────────────────────────────────────────────────────────────────

class UserDetailSerializer(serializers.ModelSerializer):
    full_name           = serializers.CharField(source='get_full_name', read_only=True)
    student_profile     = StudentProfileSerializer(read_only=True)
    instructor_profile  = InstructorProfileSerializer(read_only=True)

    class Meta:
        model            = User
        fields           = ('id', 'email', 'first_name', 'last_name', 'full_name',
                            'is_instructor', 'date_joined', 'is_active',
                            'student_profile', 'instructor_profile', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_active')