# Project File Structure

Complete file listing in order of importance for understanding the project:

## Core Project Files

1. **manage.py** - Django management script
2. **requirements.txt** - Python dependencies
3. **env.example** - Environment variables template
4. **.gitignore** - Git ignore patterns
5. **README.md** - Setup and usage instructions

## Project Configuration

6. **e_learning_platform/__init__.py** - Package marker
7. **e_learning_platform/settings.py** - Django settings (database, apps, JWT, media)
8. **e_learning_platform/urls.py** - Root URL configuration
9. **e_learning_platform/wsgi.py** - WSGI application
10. **e_learning_platform/asgi.py** - ASGI application

## Accounts App (Authentication & Users)

11. **accounts/__init__.py** - Package marker
12. **accounts/apps.py** - App configuration
13. **accounts/models.py** - User, StudentProfile, InstructorProfile models
14. **accounts/permissions.py** - Custom permission classes
15. **accounts/serializers.py** - User and profile serializers
16. **accounts/jwt_serializers.py** - Custom JWT token serializer (email-based)
17. **accounts/jwt_views.py** - Custom JWT token view
18. **accounts/views.py** - UserViewSet, StudentProfileViewSet, InstructorProfileViewSet
19. **accounts/urls.py** - Accounts URL routing
20. **accounts/admin.py** - Admin configuration for accounts
21. **accounts/tests.py** - Tests for registration, JWT auth, profiles

## Courses App (Course Management)

22. **courses/__init__.py** - Package marker
23. **courses/apps.py** - App configuration
24. **courses/models.py** - Course, Section, Lecture models
25. **courses/permissions.py** - Course-specific permissions
26. **courses/serializers.py** - Course, Section, Lecture serializers
27. **courses/views.py** - CourseViewSet, SectionViewSet, LectureViewSet
28. **courses/urls.py** - Courses URL routing
29. **courses/admin.py** - Admin configuration for courses (with approval actions)
30. **courses/tests.py** - Tests for course creation, approval, visibility

## Payments App (Enrollments)

31. **payments/__init__.py** - Package marker
32. **payments/apps.py** - App configuration
33. **payments/models.py** - Enrollment model
34. **payments/serializers.py** - Enrollment serializers
35. **payments/views.py** - EnrollmentViewSet with purchase simulation
36. **payments/urls.py** - Payments URL routing
37. **payments/admin.py** - Admin configuration for enrollments
38. **payments/tests.py** - Tests for enrollment, duplicate prevention

## Quick Reference

### Model Relationships
- User → StudentProfile (OneToOne)
- User → InstructorProfile (OneToOne)
- User → Course (ForeignKey, instructor)
- Course → Section (ForeignKey)
- Section → Lecture (ForeignKey)
- User → Enrollment (ForeignKey, student)
- Course → Enrollment (ForeignKey)

### Key Features by File
- **settings.py**: JWT config, pagination, filtering, media settings
- **accounts/models.py**: Custom User with email as username, is_instructor flag
- **courses/models.py**: Course approval workflow, slug generation
- **payments/models.py**: Enrollment with fake payment simulation
- **All views.py**: DRF ViewSets with proper permissions
- **All admin.py**: Django admin with useful actions

### API Entry Points
- `/api/auth/` - Authentication endpoints
- `/api/accounts/` - User management
- `/api/courses/` - Course CRUD operations
- `/api/enrollments/` - Enrollment management
