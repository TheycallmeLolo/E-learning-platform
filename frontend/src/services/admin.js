// src/services/admin.js
import api from './api';

export const adminService = {
  getPendingCourses: async () => {
    const response = await api.get('/admin/courses/pending/');
    return response.data; // هنا هترجع array من الكورسات المعلقة
  },

  approveCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/approve/`);
    return response.data;
  },

  rejectCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/reject/`);
    return response.data;
  },
};



