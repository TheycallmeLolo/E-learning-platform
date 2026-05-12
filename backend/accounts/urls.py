from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    UserViewSet, StudentProfileViewSet, InstructorProfileViewSet,
    PendingInstructorsAdminView, ApproveInstructorAdminView,
)
from .jwt_views import CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'users',               UserViewSet,             basename='user')
router.register(r'student-profiles',    StudentProfileViewSet,   basename='student-profile')
router.register(r'instructor-profiles', InstructorProfileViewSet,basename='instructor-profile')

# Admin approval router
admin_router = DefaultRouter()
admin_router.register(r'instructors', ApproveInstructorAdminView, basename='admin-instructor')

urlpatterns = [
    path('', include(router.urls)),

    # JWT
    path('token/',         CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(),          name='token_refresh'),
    path('token/verify/',  TokenVerifyView.as_view(),           name='token_verify'),
    path('register/',      UserViewSet.as_view({'post': 'register'}), name='user-register'),

    # Admin endpoints
    path('admin/pending-instructors/', PendingInstructorsAdminView.as_view(),
         name='admin-pending-instructors'),
    path('admin/', include(admin_router.urls)),
]