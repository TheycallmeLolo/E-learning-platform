from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExperienceViewSet,
    PendingExperiencesAdminView,
    ExperiencePurchasesAdminView,
)

router = DefaultRouter()
router.register(r'', ExperienceViewSet, basename='experience')

urlpatterns = [
    # ── Admin static paths FIRST ──────────────────────────────────────────────
    path('admin/pending/',
         PendingExperiencesAdminView.as_view(), name='admin-pending-experiences'),
    path('admin/purchases/',
         ExperiencePurchasesAdminView.as_view(), name='admin-experience-purchases'),

    # ── Router LAST ───────────────────────────────────────────────────────────
    path('', include(router.urls)),
]