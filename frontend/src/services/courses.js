import api from './api';

export const coursesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/courses/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  getContent: async (id) => {
    const response = await api.get(`/courses/${id}/content/`);
    return response.data;
  },

  create: async (courseData) => {
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('price', courseData.price);
    if (courseData.image) {
      formData.append('image', courseData.image);
    }

    const response = await api.post('/courses/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id, courseData) => {
    const formData = new FormData();
    if (courseData.title) formData.append('title', courseData.title);
    if (courseData.description) formData.append('description', courseData.description);
    if (courseData.price !== undefined) formData.append('price', courseData.price);
    if (courseData.image) {
      formData.append('image', courseData.image);
    }

    const response = await api.patch(`/courses/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createSection: async (courseId, sectionData) => {
    const response = await api.post('/courses/sections/', {
      ...sectionData,
      course: courseId,
    });
    return response.data;
  },

  createLecture: async (sectionId, lectureData) => {
    const response = await api.post('/courses/lectures/', {
      ...lectureData,
      section: sectionId,
    });
    return response.data;
  },
};
