from rest_framework_simplejwt.views import TokenObtainPairView
from .jwt_serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT view that accepts email instead of username."""
    serializer_class = CustomTokenObtainPairSerializer
