from notifications.utils import send_welcome_email
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings

from .models import StudentProfile, InstructorProfile
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserDetailSerializer,
    StudentProfileSerializer, InstructorProfileSerializer, InstructorCardSerializer,
)
from .permissions import IsOwnerOrReadOnly

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == 'register':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        return Response(
            UserDetailSerializer(request.user, context={'request': request}).data
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            try:
                send_welcome_email(user)
            except Exception as e:
                print(f"[Email Error] {e}")

            # ✅ إشعار الأدمن لو المسجل مدرس
            if user.is_instructor:
                try:
                    admins = User.objects.filter(is_staff=True).values_list('email', flat=True)
                    if admins:
                        send_mail(
                            subject='طلب تسجيل مدرس جديد',
                            message=f'يوجد طلب تسجيل جديد من:\n'
                                    f'الاسم: {user.get_full_name()}\n'
                                    f'الإيميل: {user.email}\n\n'
                                    f'يرجى مراجعة الطلب والموافقة عليه.',
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=list(admins),
                            fail_silently=True,
                        )
                except Exception as e:
                    print(f"[Email Error] admin notification: {e}")

            return Response({
                'user'     : UserSerializer(user).data,
                'refresh'  : str(refresh),
                'access'   : str(refresh.access_token),
                'pending_approval': user.is_instructor and not user.is_approved,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def become_instructor(self, request):
        if request.user.is_instructor:
            return Response({'error': 'User is already an instructor'}, status=400)
        request.user.is_instructor = True
        request.user.is_approved   = False   # ينتظر موافقة
        request.user.save()
        if not hasattr(request.user, 'instructor_profile'):
            InstructorProfile.objects.create(user=request.user)
        if hasattr(request.user, 'student_profile'):
            request.user.student_profile.delete()
        return Response(
            UserDetailSerializer(request.user, context={'request': request}).data
        )


# ── Pending instructors ───────────────────────────────────────────────────────
class PendingInstructorsAdminView(ListAPIView):
    """GET /api/accounts/admin/pending-instructors/ — قائمة المدرسين المنتظرين"""
    serializer_class   = UserDetailSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(
            is_instructor=True, is_approved=False
        ).select_related('instructor_profile')


# ── Approve / Reject instructor ───────────────────────────────────────────────
class ApproveInstructorAdminView(viewsets.ViewSet):
    """
    POST /api/accounts/admin/instructors/:id/approve/
    POST /api/accounts/admin/instructors/:id/reject/
    """
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk, is_instructor=True)
        except User.DoesNotExist:
            return Response({'detail': 'مدرس غير موجود'}, status=404)

        user.is_approved = True
        user.save()

        try:
            send_mail(
                subject='تم قبول طلبك كمدرّس! 🎉',
                message=f'مرحباً {user.get_full_name()}،\n\n'
                        f'تم قبول طلبك كمدرّس على المنصة.\n'
                        f'يمكنك الآن إنشاء الكورسات والتجارب.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            'message'    : f'تم قبول {user.get_full_name()} كمدرّس ✅',
            'is_approved': True,
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk, is_instructor=True)
        except User.DoesNotExist:
            return Response({'detail': 'مدرس غير موجود'}, status=404)

        reason = request.data.get('reason', '')
        user.is_approved   = False
        user.is_instructor = False   # إلغاء صفة المدرس
        user.save()

        try:
            send_mail(
                subject='بخصوص طلب التسجيل كمدرّس',
                message=f'مرحباً {user.get_full_name()}،\n\n'
                        f'نأسف، لم يتم قبول طلبك كمدرّس حالياً.\n'
                        + (f'السبب: {reason}\n' if reason else '')
                        + f'\nيمكنك التواصل معنا لمزيد من المعلومات.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({'message': 'تم رفض الطلب'})


# ── Profile ViewSets (unchanged) ──────────────────────────────────────────────
class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset           = StudentProfile.objects.select_related('user').all()
    serializer_class   = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return StudentProfile.objects.all()
        return StudentProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InstructorProfileViewSet(viewsets.ModelViewSet):
    queryset = InstructorProfile.objects.select_related('user').all()

    def get_serializer_class(self):
        return InstructorCardSerializer if self.action == 'list' else InstructorProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        qs      = InstructorProfile.objects.select_related('user').all()
        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs

    def perform_create(self, serializer):
        if not serializer.validated_data.get('user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    def get_serializer_context(self):
        return {'request': self.request}