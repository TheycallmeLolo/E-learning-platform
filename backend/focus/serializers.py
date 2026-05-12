# focus/serializers.py
from rest_framework import serializers
from .models import FocusSession


class FocusSessionSerializer(serializers.ModelSerializer):
    focus_level  = serializers.CharField(read_only=True)
    lecture_title = serializers.SerializerMethodField()

    class Meta:
        model  = FocusSession
        fields = ('id', 'student', 'lecture', 'lecture_title',
                  'total_watch_seconds', 'distracted_count',
                  'distracted_times', 'focus_score', 'focus_level', 'created_at')
        read_only_fields = ('id', 'student', 'created_at', 'focus_level')

    def get_lecture_title(self, obj):
        return obj.lecture.title if obj.lecture else None


class FocusSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FocusSession
        fields = ('lecture', 'total_watch_seconds', 'distracted_count',
                  'distracted_times', 'focus_score')

    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)

