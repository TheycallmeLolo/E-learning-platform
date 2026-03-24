from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    SectionViewSet,
    LectureViewSet,
    PendingCoursesAdminView,
    PendingLecturesAdminView,
    ApproveLectureAdminView,
    PresignedUploadURLView,
    LectureStreamURLView,
)

courses_router  = DefaultRouter()
sections_router = DefaultRouter()
lectures_router = DefaultRouter()

courses_router.register(r'', CourseViewSet, basename='course')
sections_router.register(r'', SectionViewSet, basename='section')
lectures_router.register(r'', LectureViewSet, basename='lecture')

urlpatterns = [

    # ─── Static / custom paths FIRST (قبل أي router عشان مايتعارضش) ──────────

    # S3
    path('lectures/presigned-upload/',
         PresignedUploadURLView.as_view(), name='presigned-upload'),
    path('lectures/<uuid:lecture_id>/stream/',
         LectureStreamURLView.as_view(), name='lecture-stream'),

    # Admin
    path('admin/courses/pending/',
         PendingCoursesAdminView.as_view(), name='admin-pending-courses'),
    path('admin/lectures/pending/',
         PendingLecturesAdminView.as_view(), name='admin-pending-lectures'),
    path('admin/lectures/<uuid:lecture_id>/approve/',
         ApproveLectureAdminView.as_view(), name='admin-approve-lecture'),

    # ─── Routers LAST ─────────────────────────────────────────────────────────
    path('sections/', include(sections_router.urls)),   # /api/courses/sections/
    path('lectures/', include(lectures_router.urls)),   # /api/courses/lectures/
    path('', include(courses_router.urls)),             # /api/courses/
]