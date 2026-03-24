from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied


class IsInstructorOrReadOnly(permissions.BasePermission):
    """Permission check: Only instructors can create/edit courses."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_instructor


class IsCourseOwnerOrReadOnly(permissions.BasePermission):
    """Permission check: Only course owner can edit/delete."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor == request.user or request.user.is_staff


class IsEnrolledOrOwner(permissions.BasePermission):
    """Permission check: Only enrolled students or course owner can view course content."""
    
    def has_object_permission(self, request, view, obj):
        # Staff and course owner can always access
        if request.user.is_staff or obj.instructor == request.user:
            return True
        
        # Check if user is enrolled
        if request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        
        return False
