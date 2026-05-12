from rest_framework import serializers
from .models import Experience, ExperiencePurchase


class ExperienceListSerializer(serializers.ModelSerializer):
    """للقوائم — خفيف."""
    instructor_name  = serializers.SerializerMethodField()
    section_title    = serializers.SerializerMethodField()
    course_title     = serializers.SerializerMethodField()
    image_url        = serializers.SerializerMethodField()
    effective_price  = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    is_purchased     = serializers.SerializerMethodField()

    class Meta:
        model  = Experience
        fields = [
            'id', 'title', 'description',
            'instructor', 'instructor_name',
            'section', 'section_title', 'course_title',
            'image', 'image_url',
            'preview_video_url',
            'price', 'discount_price', 'effective_price', 'discount_percent',
            'instructor_cut', 'college_cut',
            'is_approved', 'status', 'is_featured', 'total_buyers',
            'is_purchased',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['instructor', 'total_buyers', 'is_approved',
                            'created_at', 'updated_at']

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() or obj.instructor.email

    def get_section_title(self, obj):
        return obj.section.title if obj.section else None

    def get_course_title(self, obj):
        return obj.section.course.title if obj.section else None

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.purchases.filter(student=request.user).exists()
        return False

    def validate(self, data):
        price          = data.get('price', 0)
        discount_price = data.get('discount_price')
        if discount_price is not None and discount_price >= price:
            raise serializers.ValidationError(
                "السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي."
            )
        return data


class ExperienceDetailSerializer(ExperienceListSerializer):
    """للتفاصيل — يضيف content_video_url للمشترين فقط."""
    content_video_url = serializers.SerializerMethodField()

    class Meta(ExperienceListSerializer.Meta):
        fields = ExperienceListSerializer.Meta.fields + ['content_video_url']

    def get_content_video_url(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        user = request.user
        if user.is_staff or obj.instructor == user:
            return obj.content_video_url
        if obj.purchases.filter(student=user).exists():
            return obj.content_video_url
        return None


class ExperienceCreateSerializer(serializers.ModelSerializer):
    """للإنشاء والتعديل."""

    class Meta:
        model  = Experience
        fields = [
            'id', 'title', 'description',
            'section',
            'image', 'preview_video_url', 'content_video_url',
            'price', 'discount_price',
            'instructor_cut', 'college_cut',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        price          = data.get('price', 0)
        discount_price = data.get('discount_price')
        if discount_price is not None and discount_price >= price:
            raise serializers.ValidationError(
                "السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي."
            )
        ic = data.get('instructor_cut', 70)
        cc = data.get('college_cut', 30)
        if ic + cc != 100:
            raise serializers.ValidationError("instructor_cut + college_cut يجب أن يساوي 100")
        return data


class ExperiencePurchaseSerializer(serializers.ModelSerializer):
    experience   = ExperienceListSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model  = ExperiencePurchase
        fields = ['id', 'student', 'student_name', 'experience',
                  'amount_paid', 'instructor_earn', 'college_earn', 'purchased_at']
        read_only_fields = ['id', 'student', 'amount_paid', 'instructor_earn',
                            'college_earn', 'purchased_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email