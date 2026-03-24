from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-read'),
    path('<int:pk>/mark-read/', views.mark_as_read, name='mark-read'),
]