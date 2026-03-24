# 🎓 E-Learning Platform

![Django](https://img.shields.io/badge/Django-4.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-red?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)

A full-featured E-Learning platform for managing and delivering online courses.  
It allows users to register, enroll in courses, make payments, and provides a complete admin dashboard for system management.

---

### 👤 User Management & Security
- **Authentication:** Secure registration & login using **JWT** (JSON Web Tokens).
- **Authorization (RBAC):** Role-based access control for different tiers (e.g., Admin, Instructor, Student).
- **Fine-grained Access (ABAC):** Attribute-based control to restrict content based on **enrollment status** or **subscription expiry**.
- **Profile Management:** Users can manage their personal info, track progress, and view purchased courses.

---

### 📚 Courses System
- Create and manage courses  
- Upload course content (videos, images, files)  
- Free preview lessons support  
- Course discount system  

---

### 💳 Payments
- Purchase courses  
- Track payment transactions  

---

### 🔔 Notifications
- Send notifications to users  

---

### 🤖 Chatbot
- AI-powered assistant for user inquiries  

---

### 🛠️ Admin Dashboard
- Manage users and courses  
- Full platform control  

---

## 🛠️ Tech Stack

### Backend
- Django  
- Django REST Framework  
- JWT Authentication  
- SQLite  
- AWS S3 (for file storage)  

---

### Frontend
- React.js  
- CSS  

---

## 📁 Project Structure

```
e_learning_platform/
├── backend/
│   ├── accounts/
│   ├── courses/
│   ├── payments/
│   ├── notifications/
│   ├── chatbot/
│   └── e_learning_platform/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── routes/
    │   └── services/
```

---

## ⚙️ Installation

### 1. Clone the repository
```
git clone https://github.com/TheycallmeLolo/E-learning-platform/.git
cd E_learning_platform
```

---

### 2. Backend Setup
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### 3. Frontend Setup
```
cd frontend
npm install
npm start
```

---

## 🔑 Environment Variables

### Backend
- Email configuration  
- JWT Secret Key  
- AWS S3 credentials  

### Frontend
- API Base URL  

---

## 👥 Permissions & Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access to all resources |
| **Instructor** | Create & manage own courses |
| **Student** | Browse courses, enroll, track progress |
| **Guest** | View public course listings only |

---

## 🎯 Future Improvements

  - [ ] **Database Migration:** Moving to **PostgreSQL** for production stability.
  - [ ] **Live Interaction:** Implementing WebSockets (Django Channels) for live streaming and real-time chat.
  - [ ] **Social Learning:** Adding course ratings, reviews, and student discussion forums.
  - [ ] **Performance:** Integrating **Redis** for caching and faster response times.

---

## 👨‍💻 Author

- Ali (Lolo)  
- GitHub: https://github.com/TheycallmeLolo  

---

## 📄 License

MIT License
