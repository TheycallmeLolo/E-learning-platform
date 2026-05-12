
# ── permissions.py ────────────────────────────────────────────────────────────
from rest_framework import permissions


class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_instructor


class IsExperienceOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor == request.user or request.user.is_staff


class IsPurchasedOrOwner(permissions.BasePermission):
    """للوصول للمحتوى الكامل — مشترك أو صاحب التجربة أو أدمن."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or obj.instructor == request.user:
            return True
        if request.user.is_authenticated:
            return obj.purchases.filter(student=request.user).exists()
        return False