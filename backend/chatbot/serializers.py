from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages      = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model  = ChatSession
        fields = ['id', 'title', 'message_count', 'messages', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """للـ list بدون الـ messages عشان أخف"""
    message_count   = serializers.SerializerMethodField()
    last_message    = serializers.SerializerMethodField()

    class Meta:
        model  = ChatSession
        fields = ['id', 'title', 'message_count', 'last_message', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {'role': last.role, 'content': last.content[:100], 'created_at': last.created_at}
        return None