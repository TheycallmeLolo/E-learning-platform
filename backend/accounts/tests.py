from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class UserRegistrationTests(TestCase):
    """Test user registration."""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
    
    def test_student_registration(self):
        """Test student registration."""
        data = {
            'email': 'student@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'student@test.com')
        self.assertFalse(response.data['user']['is_instructor'])
    
    def test_instructor_registration(self):
        """Test instructor registration."""
        data = {
            'email': 'instructor@test.com',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'is_instructor': True
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['user']['is_instructor'])
    
    def test_registration_password_mismatch(self):
        """Test registration with password mismatch."""
        data = {
            'email': 'test@test.com',
            'password': 'TestPass123!',
            'password2': 'DifferentPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class JWTAuthenticationTests(TestCase):
    """Test JWT authentication."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@test.com',
            password='TestPass123!'
        )
        self.login_url = '/api/auth/token/'
        self.refresh_url = '/api/auth/token/refresh/'
    
    def test_jwt_login(self):
        """Test JWT token obtain."""
        data = {
            'email': 'test@test.com',
            'password': 'TestPass123!'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_jwt_refresh(self):
        """Test JWT token refresh."""
        refresh = RefreshToken.for_user(self.user)
        data = {'refresh': str(refresh)}
        response = self.client.post(self.refresh_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_authenticated_request(self):
        """Test authenticated API request."""
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.get('/api/accounts/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@test.com')
