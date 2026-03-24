# E-Learning Marketplace - React Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

Complete React 18 frontend for the Django e-learning marketplace API.

---

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

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### 3. Start Development Server

```bash
npm start
```

The app will run on `http://localhost:3000`

---

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

---

## API Integration

The frontend integrates with:

| Endpoint | Description |
|---|---|
| `/api/auth/token/` | Login |
| `/api/auth/register/` | Registration |
| `/api/courses/` | Course listing |
| `/api/courses/{id}/` | Course details |
| `/api/enrollments/` | Enrollment management |
| `/api/accounts/users/me/` | User profile |

---

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

---

## Authentication

- JWT tokens stored in localStorage
- Auto-inject Authorization header in API requests
- Automatic redirect to login on 401 errors
- Protected routes for authenticated users

---

## CORS Setup

Ensure Django `django-cors-headers` is configured:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## Build for Production

```bash
npm run build
```

Output will be in the `build/` directory.

---

## 👨‍💻 Author

**Ali (Lolo)**
GitHub: [TheycallmeLolo](https://github.com/TheycallmeLolo)

---

## 📄 License

This project is licensed under the MIT License.
