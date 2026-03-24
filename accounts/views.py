from notifications.utils import send_welcome_email
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import StudentProfile, InstructorProfile
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserDetailSerializer,
    StudentProfileSerializer,
    InstructorProfileSerializer,
)
from .permissions import IsOwnerOrReadOnly

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == 'register':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(id=self.request.user.id)
        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            # ── إرسال إيميل ترحيبي ────────────────────────────────────────
            try:
                send_welcome_email(user)
            except Exception as e:
                print(f"[Email Error] welcome email failed: {e}")

            return Response({
                'user':    UserSerializer(user).data,
                'refresh': str(refresh),
                'access':  str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def become_instructor(self, request):
        if request.user.is_instructor:
            return Response(
                {'error': 'User is already an instructor'},
                status=status.HTTP_400_BAD_REQUEST
            )
        request.user.is_instructor = True
        request.user.save()

        if not hasattr(request.user, 'instructor_profile'):
            InstructorProfile.objects.create(user=request.user)
        if hasattr(request.user, 'student_profile'):
            request.user.student_profile.delete()

        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InstructorProfileViewSet(viewsets.ModelViewSet):
    queryset = InstructorProfile.objects.all()
    serializer_class = InstructorProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        if not self.request.user.is_staff:
            return InstructorProfile.objects.filter(user=self.request.user)
        return InstructorProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)