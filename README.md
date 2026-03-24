# 🎓 E-Learning Platform API

<div align="center">

![Django](https://img.shields.io/badge/Django-4.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-red?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)

A full-featured **RESTful API** for an online learning platform — supporting user authentication, course management, and payment processing.

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Permissions & Roles](#-permissions--roles)
- [Running Tests](#-running-tests)
- [Contributing](#-contributing)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login, registration, token refresh & blacklisting
- 📧 **Email Verification** — Account activation via email
- 👨‍🏫 **Role-Based Access** — Student, Instructor, and Admin roles with custom permissions
- 📚 **Course Management** — Full CRUD for courses, lessons, and enrollments
- 💳 **Payment Integration** — Payment processing with order tracking
- 🖼️ **Media Uploads** — Course image uploads via Django media handling
- 🔒 **Custom Permissions** — Granular access control per resource

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django + Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Payments | Custom payments app |
| Media | Django media files |
| Testing | Django TestCase |

---

## 📁 Project Structure

```
e_learning_platform/
├── manage.py
├── requirements.txt
├── .env.example                  # Environment variables template
│
├── e_learning_platform/          # Core project settings
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── accounts/                     # User management & authentication
│   ├── models.py                 # Custom User model
│   ├── views.py                  # Registration, login, profile
│   ├── jwt_views.py              # JWT token endpoints
│   ├── jwt_serializers.py        # JWT custom serializers
│   ├── serializers.py            # User serializers
│   ├── permissions.py            # Custom permission classes
│   ├── email_utils.py            # Email sending helpers
│   └── urls.py
│
├── courses/                      # Course & enrollment management
│   ├── models.py                 # Course, Lesson, Enrollment models
│   ├── views.py                  # Course CRUD + enrollment logic
│   ├── serializers.py
│   ├── permissions.py
│   └── urls.py
│
├── payments/                     # Payment processing
│   ├── models.py                 # Payment, Order models
│   ├── views.py                  # Payment endpoints
│   ├── serializers.py
│   └── urls.py
│
└── media/
    └── courses/images/           # Uploaded course thumbnails
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- pip
- virtualenv (recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/e-learning-platform.git
cd e-learning-platform

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 5. Apply migrations
python manage.py migrate

# 6. Create a superuser
python manage.py createsuperuser

# 7. Run the development server
python manage.py runserver
```

The API will be available at: `http://127.0.0.1:8000/`

---

## 🔧 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

# Database (leave default for SQLite)
DATABASE_URL=sqlite:///db.sqlite3

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Payment Settings (if applicable)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📡 API Endpoints

### 🔐 Authentication — `/api/accounts/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/register/` | Register a new user | ❌ |
| POST | `/login/` | Login & get JWT tokens | ❌ |
| POST | `/token/refresh/` | Refresh access token | ❌ |
| POST | `/logout/` | Blacklist refresh token | ✅ |
| GET | `/profile/` | Get current user profile | ✅ |
| PUT | `/profile/` | Update user profile | ✅ |
| POST | `/verify-email/` | Verify email with token | ❌ |

### 📚 Courses — `/api/courses/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| GET | `/` | List all courses | ❌ |
| POST | `/` | Create a new course | ✅ Instructor |
| GET | `/{id}/` | Get course detail | ❌ |
| PUT | `/{id}/` | Update course | ✅ Owner |
| DELETE | `/{id}/` | Delete course | ✅ Owner |
| POST | `/{id}/enroll/` | Enroll in a course | ✅ Student |
| GET | `/my-courses/` | List enrolled courses | ✅ |

### 💳 Payments — `/api/payments/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/checkout/` | Initiate payment | ✅ |
| GET | `/orders/` | List user orders | ✅ |
| GET | `/orders/{id}/` | Order detail | ✅ |

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** via `djangorestframework-simplejwt`.

**Login** to receive tokens:
```json
POST /api/accounts/login/
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Use the access token** in all protected requests:
```
Authorization: Bearer <access_token>
```

**Refresh** when the access token expires:
```json
POST /api/accounts/token/refresh/
{
  "refresh": "your-refresh-token"
}
```

---

## 👥 Permissions & Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access to all resources |
| **Instructor** | Create & manage own courses |
| **Student** | Browse courses, enroll, track progress |
| **Guest** | View public course listings only |

---

## 🧪 Running Tests

```bash
# Run all tests
python manage.py test

# Run tests for a specific app
python manage.py test accounts
python manage.py test courses
python manage.py test payments

# Run with verbosity
python manage.py test --verbosity=2
```

---

## 🚢 Deployment (Production)

```bash
# Switch to PostgreSQL in settings.py / .env
# Collect static files
python manage.py collectstatic

# Apply migrations on production DB
python manage.py migrate

# Use Gunicorn as WSGI server
pip install gunicorn
gunicorn e_learning_platform.wsgi:application --bind 0.0.0.0:8000
```

> 💡 For production: Set `DEBUG=False`, configure `ALLOWED_HOSTS`, and use a proper database like **PostgreSQL**.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ using Django REST Framework
</div>
