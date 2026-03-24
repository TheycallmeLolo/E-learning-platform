import api from './api';

export const enrollmentsService = {
  getAll: async () => {
    const response = await api.get('/enrollments/');
    return response.data;
  },

  getMyCourses: async () => {
    const response = await api.get('/enrollments/my_courses/');
    return response.data;
  },

  enroll: async (courseId) => {
    const response = await api.post('/enrollments/', {
      course_id: courseId,
    });
    return response.data;
  },

  checkEnrollment: async (courseId) => {
    try {
      const response = await api.get('/enrollments/', {
        params: { course: courseId },
      });
      return response.data.results && response.data.results.length > 0;
    } catch (error) {
      return false;
    }
  },
};
