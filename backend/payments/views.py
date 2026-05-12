from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model

from notifications.utils import notify_enrollment
from .models import Enrollment, SectionExperience, SectionExperiencePurchase
from .serializers import (
    EnrollmentSerializer, EnrollmentCreateSerializer,
    SectionExperienceListSerializer, SectionExperienceDetailSerializer,
    SectionExperienceCreateSerializer,
    SectionExperiencePurchaseSerializer, SectionExperienceBuySerializer,
)

User = get_user_model()


# ── Enrollment ViewSet (unchanged) ────────────────────────────────────────────

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset           = Enrollment.objects.select_related('student', 'course',
                                                            'course__instructor')
    serializer_class   = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Enrollment.objects.select_related('student', 'course', 'course__instructor')
        if not self.request.user.is_staff:
            qs = qs.filter(student=self.request.user)
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def get_serializer_class(self):
        return EnrollmentCreateSerializer if self.action == 'create' else EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = EnrollmentCreateSerializer(data=request.data,
                                                 context={'request': request})
        if serializer.is_valid():
            enrollment = serializer.save()
            notify_enrollment(enrollment)
            return Response(
                {'message': 'Enrollment successful!',
                 'enrollment': EnrollmentSerializer(enrollment,
                                                     context={'request': request}).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        enrollments = self.get_queryset().filter(student=request.user)
        return Response(self.get_serializer(enrollments, many=True).data)


# ── Section Experience ViewSet ────────────────────────────────────────────────

class SectionExperienceViewSet(viewsets.ModelViewSet):
    """
    CRUD للتجارب + endpoint للشراء.

    GET  /api/payments/experiences/              → قائمة المنشور
    GET  /api/payments/experiences/:id/          → تفاصيل
    POST /api/payments/experiences/              → إنشاء (مدرس)
    POST /api/payments/experiences/:id/buy/      → شراء (طالب)
    GET  /api/payments/experiences/my_purchases/ → مشترياتي
    GET  /api/payments/experiences/my_created/   → اللي أنشأتها (مدرس)
    PATCH /api/payments/experiences/:id/toggle_status/ → publish/draft
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status', 'is_featured', 'section__course']
    search_fields      = ['title', 'description', 'section__title',
                          'section__course__title']
    ordering_fields    = ['created_at', 'price', 'total_buyers']
    ordering           = ['-created_at']

    def get_queryset(self):
        qs   = SectionExperience.objects.select_related(
            'section', 'section__course', 'section__course__instructor'
        ).prefetch_related('purchases')
        user = self.request.user

        # الأدمن يشوف كل حاجة
        if user.is_authenticated and user.is_staff:
            return qs
        # المدرس يشوف بتاعته + كل المنشور
        if user.is_authenticated and user.is_instructor:
            from django.db.models import Q
            return qs.filter(
                Q(section__course__instructor=user) | Q(status='published')
            )
        # باقي الناس: المنشور بس
        return qs.filter(status='published')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return SectionExperienceCreateSerializer
        if self.action == 'retrieve':
            return SectionExperienceDetailSerializer
        return SectionExperienceListSerializer

    def perform_create(self, serializer):
        # تأكد إن المدرس صاحب الـ section
        from courses.models import Section
        section_id = self.request.data.get('section')
        try:
            section = Section.objects.select_related('course').get(pk=section_id)
        except Section.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("السكشن غير موجود.")
        if section.course.instructor != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("يمكنك فقط إنشاء تجارب لسكاشنك الخاصة.")
        serializer.save()

    # ── شراء ──────────────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated],
            url_path='buy')
    def buy(self, request, pk=None):
        experience = self.get_object()
        serializer = SectionExperienceBuySerializer(
            data={'experience_id': str(experience.id)},
            context={'request': request}
        )
        if serializer.is_valid():
            purchase = serializer.save()
            return Response(
                {
                    'message'   : 'تم شراء التجربة بنجاح! 🎉',
                    'purchase_id': str(purchase.id),
                    'experience' : SectionExperienceDetailSerializer(
                        experience, context={'request': request}
                    ).data,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── مشترياتي ──────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated],
            url_path='my_purchases')
    def my_purchases(self, request):
        purchases = SectionExperiencePurchase.objects.filter(
            student=request.user, payment_status='completed'
        ).select_related('experience__section__course__instructor')
        serializer = SectionExperiencePurchaseSerializer(
            purchases, many=True, context={'request': request}
        )
        return Response(serializer.data)

    # ── اللي أنشأها المدرس ────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated],
            url_path='my_created')
    def my_created(self, request):
        if not request.user.is_instructor:
            return Response({'error': 'مدرسين فقط'}, status=403)
        qs = SectionExperience.objects.filter(
            section__course__instructor=request.user
        ).select_related('section__course')
        serializer = SectionExperienceDetailSerializer(
            qs, many=True, context={'request': request}
        )
        return Response(serializer.data)

    # ── publish / draft ────────────────────────────────────────────────────────
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated],
            url_path='toggle_status')
    def toggle_status(self, request, pk=None):
        exp  = self.get_object()
        user = request.user
        if exp.section.course.instructor != user and not user.is_staff:
            return Response({'error': 'غير مصرح'}, status=403)
        exp.status = 'published' if exp.status == 'draft' else 'draft'
        exp.save()
        return Response({'status': exp.status,
                         'message': f'التجربة أصبحت {"منشورة" if exp.status == "published" else "مسودة"}'})


# ── Admin: purchases overview ─────────────────────────────────────────────────

class ExperiencePurchasesAdminView(APIView):
    """أدمن: شوف كل المشتريات مع الأرباح."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Sum, Count
        purchases = SectionExperiencePurchase.objects.filter(
            payment_status='completed'
        ).select_related('student', 'experience__section__course__instructor')

        # إحصائيات
        stats = purchases.aggregate(
            total_revenue   = Sum('amount_paid'),
            college_revenue = Sum('college_earn'),
            instructor_pay  = Sum('instructor_earn'),
            count           = Count('id'),
        )

        serializer = SectionExperiencePurchaseSerializer(
            purchases, many=True, context={'request': request}
        )
        return Response({'stats': stats, 'purchases': serializer.data})