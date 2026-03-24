# Quick Setup Guide

## Installation

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Windows
   copy env.example .env
   
   # Linux/Mac
   cp env.example .env
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Environment Configuration

Edit `.env` file and set:
```
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

Make sure your Django backend is running on port 8000.

## First Steps

1. Register a new account (student or instructor)
2. Browse courses on the home page
3. Enroll in courses (students)
4. Create courses (instructors - requires admin approval)

## Troubleshooting

### CORS Errors
Make sure Django `django-cors-headers` is configured to allow `http://localhost:3000`

### API Connection Issues
- Verify Django server is running on port 8000
- Check `.env` file has correct API URL
- Check browser console for detailed error messages
