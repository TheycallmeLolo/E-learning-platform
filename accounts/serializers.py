from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, StudentProfile, InstructorProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'is_instructor')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'is_instructor': {'required': False, 'default': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        is_instructor = validated_data.pop('is_instructor', False)
        
        user = User.objects.create_user(
            password=password,
            is_instructor=is_instructor,
            is_active=True, 
            **validated_data
        )
        
        # Create profile based on user type
        if is_instructor:
            InstructorProfile.objects.create(user=user)
        else:
            StudentProfile.objects.create(user=user)
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name', 
                  'is_instructor', 'date_joined', 'is_active', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_active')


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for Student Profile."""
    user = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentProfile
        fields = ('id', 'user', 'avatar', 'avatar_url', 'bio', 'phone_number', 
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class InstructorProfileSerializer(serializers.ModelSerializer):
    """Serializer for Instructor Profile."""
    user = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    course_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InstructorProfile
        fields = ('id', 'user', 'avatar', 'avatar_url', 'bio', 'expertise', 
                  'website', 'phone_number', 'course_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'course_count')
    
    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_course_count(self, obj):
        return obj.user.courses.count()


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with profile information."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    student_profile = StudentProfileSerializer(read_only=True)
    instructor_profile = InstructorProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'full_name',
                  'is_instructor', 'date_joined', 'is_active',
                  'student_profile', 'instructor_profile', 'is_staff')
        read_only_fields = ('id', 'date_joined', 'is_active')
