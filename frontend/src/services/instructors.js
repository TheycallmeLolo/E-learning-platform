// src/services/instructors.js
import api from './api';

export const getInstructors = () =>
  api.get('/accounts/instructor-profiles/');

export const getInstructorById = (id) =>
  api.get(`/accounts/instructor-profiles/${id}/`);

export const getInstructorCourses = (userId) =>
  api.get(`/courses/?instructor=${userId}`);

// ✅ pendingToken اختياري — بيُستخدم في Step 3 تسجيل المدرس قبل موافقة الأدمن
export const updateInstructorProfile = (id, formData, pendingToken = null) => {
  const headers = { 'Content-Type': 'multipart/form-data' };
  if (pendingToken) {
    headers['Authorization'] = `Bearer ${pendingToken}`;
  }
  return api.patch(`/accounts/instructor-profiles/${id}/`, formData, { headers });
};