from django.urls import path
from .views import ChatbotView, ChatSessionListView, ChatSessionDetailView

urlpatterns = [
    path('',                        ChatbotView.as_view(),           name='chatbot'),
    path('sessions/',               ChatSessionListView.as_view(),   name='chat-sessions'),
    path('sessions/<uuid:pk>/',     ChatSessionDetailView.as_view(), name='chat-session-detail'),
]