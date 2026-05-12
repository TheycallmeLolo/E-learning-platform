from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Experience, ExperiencePurchase

User = get_user_model()


class ExperienceCreationTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.instructor = User.objects.create_user(
            email='instructor@test.com', password='TestPass123!', is_instructor=True
        )
        self.student = User.objects.create_user(
            email='student@test.com', password='TestPass123!', is_instructor=False
        )
        refresh = RefreshToken.for_user(self.instructor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_instructor_creates_experience(self):
        data = {'title': 'تجربة اختبار', 'description': 'وصف', 'price': '99.00',
                'instructor_cut': 70, 'college_cut': 30}
        response = self.client.post('/api/experiences/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data['is_approved'])

    def test_student_cannot_create_experience(self):
        refresh = RefreshToken.for_user(self.student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {'title': 'تجربة', 'price': '50.00', 'instructor_cut': 70, 'college_cut': 30}
        response = self.client.post('/api/experiences/', data, format='json')
        self.assertIn(response.status_code, [403, 400])


class ExperienceApprovalTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@test.com', password='TestPass123!',
            is_staff=True, is_superuser=True, is_instructor=True
        )
        self.instructor = User.objects.create_user(
            email='instructor@test.com', password='TestPass123!', is_instructor=True
        )
        self.experience = Experience.objects.create(
            title='تجربة غير معتمدة', description='test', price=99,
            instructor=self.instructor, is_approved=False, status='draft',
            instructor_cut=70, college_cut=30,
        )
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_admin_approves_experience(self):
        response = self.client.post(f'/api/experiences/{self.experience.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unapproved_not_visible_to_students(self):
        student = User.objects.create_user(email='s@test.com', password='TestPass123!')
        refresh = RefreshToken.for_user(student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get('/api/experiences/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [str(e['id']) for e in (response.data.get('results') or response.data)]
        self.assertNotIn(str(self.experience.id), ids)

    def test_buy_experience(self):
        self.experience.is_approved = True
        self.experience.status      = 'published'
        self.experience.save()
        student = User.objects.create_user(email='buyer@test.com', password='TestPass123!')
        refresh = RefreshToken.for_user(student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.post(f'/api/experiences/{self.experience.id}/buy/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_content_video_hidden_before_purchase(self):
        self.experience.is_approved       = True
        self.experience.status            = 'published'
        self.experience.content_video_url = 'https://example.com/secret.mp4'
        self.experience.save()
        student = User.objects.create_user(email='anon@test.com', password='TestPass123!')
        refresh = RefreshToken.for_user(student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get(f'/api/experiences/{self.experience.id}/')
        self.assertIsNone(response.data.get('content_video_url'))