from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from courses.models import Course
from .models import Enrollment

User = get_user_model()


class EnrollmentTests(TestCase):
    """Test enrollment functionality."""
    
    def setUp(self):
        self.client = APIClient()
        self.instructor = User.objects.create_user(
            email='instructor@test.com',
            password='TestPass123!',
            is_instructor=True
        )
        self.student = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            price=99.99,
            instructor=self.instructor,
            is_approved=True,
            is_published=True
        )
        refresh = RefreshToken.for_user(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_student_enrolls_in_course(self):
        """Test student can enroll in a course."""
        data = {'course_id': str(self.course.id)}
        response = self.client.post('/api/enrollments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('enrollment', response.data)
        self.assertEqual(response.data['enrollment']['course']['id'], str(self.course.id))
        
        # Verify enrollment was created
        enrollment = Enrollment.objects.get(student=self.student, course=self.course)
        self.assertEqual(float(enrollment.amount_paid), 99.99)
        self.assertEqual(enrollment.payment_status, 'completed')
    
    def test_duplicate_enrollment_prevented(self):
        """Test duplicate enrollment is prevented."""
        # Create first enrollment
        Enrollment.objects.create(
            student=self.student,
            course=self.course,
            amount_paid=self.course.price,
            payment_status='completed'
        )
        
        # Try to enroll again
        data = {'course_id': str(self.course.id)}
        response = self.client.post('/api/enrollments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already enrolled', str(response.data).lower())
    
    def test_enrollment_unapproved_course_fails(self):
        """Test enrollment in unapproved course fails."""
        unapproved_course = Course.objects.create(
            title='Unapproved Course',
            description='Test',
            price=49.99,
            instructor=self.instructor,
            is_approved=False,
            is_published=False
        )
        
        data = {'course_id': str(unapproved_course.id)}
        response = self.client.post('/api/enrollments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_student_views_enrolled_courses(self):
        """Test student can view their enrolled courses."""
        Enrollment.objects.create(
            student=self.student,
            course=self.course,
            amount_paid=self.course.price,
            payment_status='completed'
        )
        
        response = self.client.get('/api/enrollments/my_courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['course']['id'], str(self.course.id))
