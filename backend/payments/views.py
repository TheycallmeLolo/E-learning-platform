from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from notifications.utils import notify_enrollment  # ← إضافة
from .models import Enrollment
from .serializers import EnrollmentSerializer, EnrollmentCreateSerializer

User = get_user_model()


class EnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Enrollment model."""
    queryset = Enrollment.objects.select_related('student', 'course', 'course__instructor')
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Enrollment.objects.select_related('student', 'course', 'course__instructor')
        
        # Students can only see their own enrollments
        # Staff can see all enrollments
        if not self.request.user.is_staff:
            queryset = queryset.filter(student=self.request.user)
        
        # Filter by course if provided
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer
    
    def create(self, request, *args, **kwargs):
        """Create enrollment (simulate purchase)."""
        serializer = EnrollmentCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            enrollment = serializer.save()
            notify_enrollment(enrollment)  # ← إرسال الإشعار بعد التسجيل
            response_serializer = EnrollmentSerializer(enrollment, context={'request': request})
            return Response(
                {
                    'message': 'Enrollment successful! Payment processed.',
                    'enrollment': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        """Get all courses enrolled by the current user."""
        enrollments = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(enrollments, many=True)
        return Response(serializer.data)