"""
URL configuration for e_learning_platform project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """API root endpoint."""
    return JsonResponse({
        'message': 'E-Learning Marketplace API',
        'version': '1.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'accounts': '/api/accounts/',
            'courses': '/api/courses/',
            'enrollments': '/api/enrollments/',
            'admin': '/admin/',
        },
        'docs': 'See README.md for API documentation'
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/enrollments/', include('payments.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/chatbot/', include('chatbot.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
