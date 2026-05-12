from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EnrollmentViewSet,
    SectionExperienceViewSet,
    ExperiencePurchasesAdminView,
)

router = DefaultRouter()
router.register(r'',            EnrollmentViewSet,       basename='enrollment')
router.register(r'experiences', SectionExperienceViewSet, basename='experience')

urlpatterns = [
    path('admin/experience-purchases/', ExperiencePurchasesAdminView.as_view(),
         name='admin-experience-purchases'),
    path('', include(router.urls)),
]