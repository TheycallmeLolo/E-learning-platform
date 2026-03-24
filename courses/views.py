from rest_framework.permissions import IsAdminUser
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
from notifications.utils import notify_enrollment, notify_new_content  # ← أضفنا notify_new_content

from .models import Course, Section, Lecture
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateSerializer,
    SectionSerializer, LectureSerializer,
)
from .permissions import IsInstructorOrReadOnly, IsCourseOwnerOrReadOnly, IsEnrolledOrOwner
from .s3_utils import generate_presigned_upload_url, generate_presigned_view_url

User = get_user_model()


# ── S3 ────────────────────────────────────────────────────────────────────────
class PresignedUploadURLView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        file_name = request.data.get('file_name', '')
        file_type = request.data.get('file_type', '')
        if not file_name or not file_type:
            return Response({'error': 'file_name and file_type are required.'}, status=400)
        try:
            upload_url, s3_key = generate_presigned_upload_url(file_name, file_type)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        return Response({'upload_url': upload_url, 's3_key': s3_key})


class LectureStreamURLView(APIView):
    permission_classes = [IsAuthenticated, IsEnrolledOrOwner]
    def get(self, request, lecture_id):
        try:
            lecture = Lecture.objects.select_related('section__course').get(id=lecture_id)
        except Lecture.DoesNotExist:
            return Response({'error': 'Lecture not found.'}, status=404)
        if not lecture.is_approved:
            return Response({'error': 'Not yet approved.'}, status=403)
        if lecture.video_type != 'upload' or not lecture.s3_key:
            return Response({'error': 'No S3 video.'}, status=400)
        return Response({'stream_url': generate_presigned_view_url(lecture.s3_key)})


# ── Admin lectures ────────────────────────────────────────────────────────────
class PendingLecturesAdminView(ListAPIView):
    serializer_class   = LectureSerializer
    permission_classes = [IsAdminUser]
    def get_queryset(self):
        return Lecture.objects.filter(video_type='upload', video_status='pending') \
                              .select_related('section__course__instructor')


class ApproveLectureAdminView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, lecture_id):
        try:
            lecture = Lecture.objects.select_related('section__course__instructor').get(id=lecture_id)
        except Lecture.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        act = request.data.get('action')
        if act == 'approve':
            lecture.video_status = 'approved'
            lecture.save()
        elif act == 'reject':
            lecture.video_status = 'rejected'
            lecture.save()
        else:
            return Response({'error': 'action must be approve or reject.'}, status=400)
        return Response({'lecture_id': str(lecture.id), 'video_status': lecture.video_status})


# ── Course ViewSet ────────────────────────────────────────────────────────────
class CourseViewSet(viewsets.ModelViewSet):
    queryset           = Course.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsCourseOwnerOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['instructor', 'is_approved', 'is_published']
    search_fields      = ['title', 'description']
    ordering_fields    = ['created_at', 'price', 'title']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':        return CourseListSerializer
        if self.action == 'retrieve':    return CourseDetailSerializer
        return CourseCreateSerializer

    def get_queryset(self):
        qs   = Course.objects.select_related('instructor').prefetch_related('sections__lectures')
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return qs
        if user.is_authenticated and user.is_instructor:
            return qs.filter(
                models.Q(instructor=user) | models.Q(is_approved=True, is_published=True)
            )
        return qs.filter(is_approved=True, is_published=True)

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user, is_approved=False, is_published=False)

    # ── تعديل سعر الكورس ─────────────────────────────────────────────────────
    @action(detail=True, methods=['patch'], url_path='update-price',
            permission_classes=[IsAuthenticated])
    def update_price(self, request, pk=None):
        course = self.get_object()
        user   = request.user

        if course.instructor != user and not user.is_staff:
            raise PermissionDenied("فقط صاحب الكورس أو الأدمن يمكنه تعديل السعر.")

        price          = request.data.get('price')
        discount_price = request.data.get('discount_price')

        if price is not None:
            try:
                price = float(price)
                if price < 0:
                    return Response({'error': 'السعر لا يمكن أن يكون سالباً.'}, status=400)
                course.price = price
            except (ValueError, TypeError):
                return Response({'error': 'قيمة السعر غير صالحة.'}, status=400)

        if 'discount_price' in request.data:
            if discount_price in (None, '', 'null'):
                course.discount_price = None
            else:
                try:
                    dp = float(discount_price)
                    if dp < 0:
                        return Response({'error': 'سعر التخفيض لا يمكن أن يكون سالباً.'}, status=400)
                    if dp >= float(course.price):
                        return Response({'error': 'سعر التخفيض يجب أن يكون أقل من السعر الأصلي.'}, status=400)
                    course.discount_price = dp
                except (ValueError, TypeError):
                    return Response({'error': 'قيمة سعر التخفيض غير صالحة.'}, status=400)

        course.save()
        return Response({
            'course_id':       str(course.id),
            'price':           float(course.price),
            'discount_price':  float(course.discount_price) if course.discount_price else None,
            'effective_price': float(course.effective_price),
            'discount_percent':course.discount_percent,
        })

    # ── Approve / Reject ──────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        course = self.get_object()
        course.is_approved  = True
        course.is_published = True
        course.save()
        try:
            send_mail(
                subject='تم اعتماد كورسك!',
                message=f'مرحباً {course.instructor.first_name}،\n\nتم اعتماد كورس "{course.title}" وهو الآن متاح للطلاب.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[course.instructor.email],
                fail_silently=True,
            )
        except Exception:
            pass
        return Response({'status': 'approved', 'course_id': str(course.id)})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        course = self.get_object()
        course.is_approved = False
        course.save()
        return Response({'status': 'rejected', 'course_id': str(course.id)})

    @action(detail=True, methods=['get'],
            permission_classes=[IsAuthenticated, IsEnrolledOrOwner])
    def content(self, request, pk=None):
        course = self.get_object()
        return Response(CourseDetailSerializer(course, context={'request': request}).data)


# ── Section ViewSet ───────────────────────────────────────────────────────────
class SectionViewSet(viewsets.ModelViewSet):
    queryset           = Section.objects.all()
    serializer_class   = SectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs        = Section.objects.select_related('course', 'course__instructor')
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.request.data.get('course'))
        if course.instructor != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("يمكنك فقط إضافة أقسام لكورساتك.")
        serializer.save()


# ── Lecture ViewSet ───────────────────────────────────────────────────────────
class LectureViewSet(viewsets.ModelViewSet):
    queryset           = Lecture.objects.all()
    serializer_class   = LectureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs         = Lecture.objects.select_related('section', 'section__course',
                                                     'section__course__instructor')
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(section_id=section_id)
        return qs

    def perform_create(self, serializer):
        section = Section.objects.select_related('course').get(pk=self.request.data.get('section'))
        if section.course.instructor != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("يمكنك فقط إضافة ليكتشرات لكورساتك.")
        video_type     = self.request.data.get('video_type', 'upload')
        initial_status = 'pending' if video_type == 'upload' else 'approved'
        lecture = serializer.save(video_status=initial_status)

        # ── إرسال إشعار للطلاب المسجلين بمحتوى جديد ──────────────────────────
        notify_new_content(lecture, section.course)


# ── Admin courses ─────────────────────────────────────────────────────────────
class PendingCoursesAdminView(ListAPIView):
    serializer_class   = CourseListSerializer
    permission_classes = [IsAdminUser]
    def get_queryset(self):
        return Course.objects.filter(is_approved=False)