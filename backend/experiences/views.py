from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.db import models
from django.core.mail import send_mail
from django.conf import settings

from .models import Experience, ExperiencePurchase
from .serializers import (
    ExperienceListSerializer, ExperienceDetailSerializer,
    ExperienceCreateSerializer, ExperiencePurchaseSerializer,
)

User = get_user_model()


# ── Experience ViewSet ────────────────────────────────────────────────────────
class ExperienceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status', 'is_approved', 'is_featured', 'instructor']
    search_fields      = ['title', 'description']
    ordering_fields    = ['created_at', 'price', 'total_buyers']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ExperienceCreateSerializer
        if self.action == 'retrieve':
            return ExperienceDetailSerializer
        return ExperienceListSerializer

    def get_queryset(self):
        qs   = Experience.objects.select_related(
            'instructor', 'section__course'
        ).prefetch_related('purchases')
        user = self.request.user

        if user.is_authenticated and user.is_staff:
            return qs

        if user.is_authenticated and user.is_instructor:
            return qs.filter(
                models.Q(instructor=user) |
                models.Q(is_approved=True, status='published')
            )

        return qs.filter(is_approved=True, status='published')

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user, is_approved=False, status='draft')

    # ── Approve ───────────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        exp = self.get_object()
        exp.is_approved = True
        exp.status      = 'published'
        exp.save()
        try:
            send_mail(
                subject='تم اعتماد تجربتك!',
                message=f'مرحباً {exp.instructor.first_name}،\n\nتم اعتماد تجربة "{exp.title}" وهي الآن متاحة للطلاب.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[exp.instructor.email],
                fail_silently=True,
            )
        except Exception:
            pass
        return Response({'status': 'approved', 'experience_id': exp.id})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        exp = self.get_object()
        exp.is_approved = False
        exp.status      = 'draft'
        exp.save()
        return Response({'status': 'rejected', 'experience_id': exp.id})

    # ── Update price ──────────────────────────────────────────────────────────
    @action(detail=True, methods=['patch'], url_path='update-price',
            permission_classes=[IsAuthenticated])
    def update_price(self, request, pk=None):
        exp  = self.get_object()
        user = request.user
        if exp.instructor != user and not user.is_staff:
            raise PermissionDenied("فقط صاحب التجربة أو الأدمن يمكنه تعديل السعر.")

        price          = request.data.get('price')
        discount_price = request.data.get('discount_price')

        if price is not None:
            try:
                price = float(price)
                if price < 0:
                    return Response({'error': 'السعر لا يمكن أن يكون سالباً.'}, status=400)
                exp.price = price
            except (ValueError, TypeError):
                return Response({'error': 'قيمة السعر غير صالحة.'}, status=400)

        if 'discount_price' in request.data:
            if discount_price in (None, '', 'null'):
                exp.discount_price = None
            else:
                try:
                    dp = float(discount_price)
                    if dp < 0:
                        return Response({'error': 'سعر التخفيض لا يمكن أن يكون سالباً.'}, status=400)
                    if dp >= float(exp.price):
                        return Response({'error': 'سعر التخفيض يجب أن يكون أقل من السعر الأصلي.'}, status=400)
                    exp.discount_price = dp
                except (ValueError, TypeError):
                    return Response({'error': 'قيمة سعر التخفيض غير صالحة.'}, status=400)

        exp.save()
        return Response({
            'experience_id'  : exp.id,
            'price'          : float(exp.price),
            'discount_price' : float(exp.discount_price) if exp.discount_price else None,
            'effective_price': float(exp.effective_price),
            'discount_percent': exp.discount_percent,
        })

    # ── شراء ──────────────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def buy(self, request, pk=None):
        exp = self.get_object()

        if not exp.is_available:
            return Response(
                {'detail': 'هذه التجربة غير متاحة — في انتظار موافقة الأدمن.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if ExperiencePurchase.objects.filter(
            student=request.user, experience=exp
        ).exists():
            return Response(
                {'detail': 'لقد اشتريت هذه التجربة من قبل.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        purchase = ExperiencePurchase.objects.create(
            student     = request.user,
            experience  = exp,
            amount_paid = exp.effective_price,
        )
        return Response(
            {
                'message'    : 'تم الشراء بنجاح! 🎉',
                'purchase_id': purchase.id,
                'experience' : ExperienceDetailSerializer(
                    exp, context={'request': request}
                ).data,
            },
            status=status.HTTP_201_CREATED
        )

    # ── مشترياتي ──────────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_purchases(self, request):
        purchases = ExperiencePurchase.objects.filter(
            student=request.user
        ).select_related('experience__instructor', 'experience__section__course')
        return Response(
            ExperiencePurchaseSerializer(purchases, many=True,
                                          context={'request': request}).data
        )

    # ── تجاربي (مدرس) ─────────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_created(self, request):
        if not request.user.is_instructor:
            return Response({'detail': 'مدرسين فقط'}, status=403)
        qs = Experience.objects.filter(
            instructor=request.user
        ).select_related('section__course').prefetch_related('purchases')
        return Response(
            ExperienceDetailSerializer(qs, many=True,
                                        context={'request': request}).data
        )

    # ── toggle status ─────────────────────────────────────────────────────────
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def toggle_status(self, request, pk=None):
        exp = self.get_object()
        if exp.instructor != request.user and not request.user.is_staff:
            return Response({'detail': 'غير مصرح'}, status=403)
        if exp.status == 'draft' and not exp.is_approved:
            return Response(
                {'detail': 'التجربة في انتظار موافقة الأدمن قبل النشر.'},
                status=400
            )
        exp.status = 'published' if exp.status == 'draft' else 'draft'
        exp.save()
        return Response({'status': exp.status})

    # ── content للمشترين (مثل courses/content) ────────────────────────────────
    @action(detail=True, methods=['get'],
            permission_classes=[IsAuthenticated])
    def content(self, request, pk=None):
        exp  = self.get_object()
        user = request.user
        if not (user.is_staff or exp.instructor == user or
                exp.purchases.filter(student=user).exists()):
            return Response({'detail': 'اشترِ التجربة أولاً.'}, status=403)
        return Response(ExperienceDetailSerializer(exp, context={'request': request}).data)


# ── Admin views ───────────────────────────────────────────────────────────────
class PendingExperiencesAdminView(ListAPIView):
    serializer_class   = ExperienceListSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Experience.objects.filter(
            is_approved=False
        ).select_related('instructor', 'section__course')


class ExperiencePurchasesAdminView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Sum, Count
        purchases = ExperiencePurchase.objects.filter().select_related(
            'student', 'experience__instructor'
        )
        stats = purchases.aggregate(
            total_revenue   = Sum('amount_paid'),
            college_revenue = Sum('college_earn'),
            instructor_pay  = Sum('instructor_earn'),
            count           = Count('id'),
        )
        return Response({
            'stats'    : stats,
            'purchases': ExperiencePurchaseSerializer(
                purchases, many=True, context={'request': request}
            ).data,
        })