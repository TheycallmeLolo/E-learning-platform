from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course, Section, Lecture

User = get_user_model()


class CourseCreationTests(TestCase):
    """Test course creation by instructors."""
    
    def setUp(self):
        self.client = APIClient()
        self.instructor = User.objects.create_user(
            email='instructor@test.com',
            password='TestPass123!',
            is_instructor=True
        )
        self.student = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!',
            is_instructor=False
        )
        refresh = RefreshToken.for_user(self.instructor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_instructor_creates_course(self):
        """Test instructor can create a course."""
        data = {
            'title': 'Test Course',
            'description': 'Test Description',
            'price': '99.99'
        }
        response = self.client.post('/api/courses/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Course')
        self.assertFalse(response.data['is_approved'])  # Should default to False
    
    def test_student_cannot_create_course(self):
        """Test student cannot create a course."""
        refresh = RefreshToken.for_user(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {
            'title': 'Test Course',
            'description': 'Test Description',
            'price': '99.99'
        }
        response = self.client.post('/api/courses/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CourseApprovalTests(TestCase):
    """Test course approval workflow."""
    
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@test.com',
            password='TestPass123!',
            is_staff=True,
            is_superuser=True,
            is_instructor=True
        )
        self.instructor = User.objects.create_user(
            email='instructor@test.com',
            password='TestPass123!',
            is_instructor=True
        )
        self.course = Course.objects.create(
            title='Unapproved Course',
            description='Test',
            price=99.99,
            instructor=self.instructor,
            is_approved=False,
            is_published=False
        )
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    
    def test_admin_approves_course(self):
        """Test admin can approve a course."""
        data = {
            'is_approved': True,
            'is_published': True
        }
        response = self.client.patch(f'/api/courses/{self.course.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_approved'])
        self.assertTrue(response.data['is_published'])
    
    def test_unapproved_course_not_visible_to_students(self):
        """Test unapproved courses are not visible to students."""
        student = User.objects.create_user(
            email='student@test.com',
            password='TestPass123!'
        )
        refresh = RefreshToken.for_user(student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course_ids = [course['id'] for course in response.data['results']]
        self.assertNotIn(str(self.course.id), course_ids)
