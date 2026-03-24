# E-Learning Marketplace - React Frontend

Complete React 18 frontend for the Django e-learning marketplace API.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set your Django API URL:

```
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will run on `http://localhost:3000`

## Features

### Public Pages
- **Home** - Featured courses showcase
- **Courses** - Browse all courses with filters
- **Course Detail** - View course information and enroll
- **Login/Register** - Authentication forms

### Student Features
- **My Courses** - View enrolled courses
- **Continue Learning** - Access course content
- **Enrollment** - Enroll in courses with fake payment

### Instructor Features
- **Dashboard** - Manage created courses
- **Create Course** - Add new courses
- **Course Status** - Track approval status

## API Integration

The frontend integrates with:
- `/api/auth/token/` - Login
- `/api/auth/register/` - Registration
- `/api/courses/` - Course listing
- `/api/courses/{id}/` - Course details
- `/api/enrollments/` - Enrollment management
- `/api/accounts/users/me/` - User profile

## Project Structure

```
src/
  components/
    auth/          # Login, Register
    courses/       # CourseCard, CourseList, CourseDetail
    dashboard/     # StudentDashboard, InstructorDashboard
    shared/        # Header, Footer
  pages/           # Home, Courses, Profile, NotFound
  routes/          # AppRoutes
  services/        # API services (api, auth, courses, enrollments)
  utils/           # PrivateRoute
  App.js           # Main app component
  index.js         # Entry point
```

## Authentication

- JWT tokens stored in localStorage
- Auto-inject Authorization header in API requests
- Automatic redirect to login on 401 errors
- Protected routes for authenticated users

## CORS Setup

Ensure Django `django-cors-headers` is configured:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## Build for Production

```bash
npm run build
```

Output will be in the `build/` directory.
