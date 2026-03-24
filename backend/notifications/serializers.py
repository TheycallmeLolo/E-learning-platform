from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 
                  'is_read', 'created_at', 'course', 'course_title']