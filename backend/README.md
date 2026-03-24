# E-Learning Platform - Django Backend

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST-Framework-ff1709?style=for-the-badge&logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

Complete Django REST Framework backend for the e-learning marketplace.

## Tech Stack

- **Python 3.10+**
- **Django 4.x** — Web framework
- **Django REST Framework** — API development
- **SimpleJWT** — JWT Authentication
- **SQLite** — Database (development)
- **AWS S3** — Video & image storage
- **Google Gemini AI** — Chatbot integration

---

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv env
source env/bin/activate        # Linux/Mac
env\Scripts\activate           # Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp oldenv.example .env
```

Edit `.env` and fill in your values:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
USER_EMAIL=your-email@gmail.com
USER_PASSWORD=your-app-password
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Admin)

```bash
python manage.py createsuperuser
```

### 6. Start Development Server

```bash
python manage.py runserver
```

API will be running at `http://localhost:8000`

---

## Project Structure

```
backend/
├── e_learning_platform/   # Django settings & main URLs
├── accounts/              # User auth, JWT, permissions
├── courses/               # Courses, lectures, S3 upload
├── payments/              # Payment processing
├── chatbot/               # Gemini AI chatbot
├── notifications/         # Notification system
├── manage.py
└── requirements.txt
```

---

## API Endpoints

### Authentication — `/api/auth/`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/token/` | Login & get JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| POST | `/api/auth/register/` | Register new user |

### Accounts — `/api/accounts/`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/accounts/users/me/` | Get current user profile |
| PUT | `/api/accounts/users/me/` | Update profile |

### Courses — `/api/courses/`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses/` | List all courses |
| POST | `/api/courses/` | Create a course (Instructor) |
| GET | `/api/courses/{id}/` | Course details |
| PUT | `/api/courses/{id}/` | Update course (Owner) |
| DELETE | `/api/courses/{id}/` | Delete course (Owner/Admin) |
| GET | `/api/courses/{id}/lectures/` | Course lectures |
| POST | `/api/courses/{id}/lectures/` | Add lecture (Instructor) |

### Enrollments — `/api/enrollments/`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/enrollments/` | My enrollments |
| POST | `/api/enrollments/` | Enroll in a course |

### Payments — `/api/payments/`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/` | Process payment |

### Notifications — `/api/notifications/`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/` | Get notifications |
| PUT | `/api/notifications/{id}/` | Mark as read |

### Chatbot — `/api/chatbot/`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chatbot/` | Send message to AI assistant |

---

## User Roles & Permissions

| Role | Description |
|---|---|
| **Student** | Browse, enroll, and access purchased courses |
| **Instructor** | Create and manage own courses |
| **Admin** | Full access via `/admin/` dashboard |

Permission classes are defined in:
- `accounts/permissions.py` — User-level permissions
- `courses/permissions.py` — Course-level permissions

---

## AWS S3 Configuration

Lecture videos and course images are stored on AWS S3. Add to `.env`:

```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=your-region
```

---

## CORS Setup

Frontend is expected at `http://localhost:3000`. Configured in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## Admin Panel

Access the Django admin at: `http://localhost:8000/admin/`

Log in with the superuser account you created.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ali (Lolo)**
GitHub: [TheycallmeLolo](https://github.com/TheycallmeLolo)
