// src/services/instructors.js
import api from './api';

export const getInstructors = () =>
  api.get('/accounts/instructor-profiles/');

export const getInstructorById = (id) =>
  api.get(`/accounts/instructor-profiles/${id}/`);

export const getInstructorCourses = (userId) =>
  api.get(`/courses/?instructor=${userId}`);

export const updateInstructorProfile = (id, formData) =>
  api.patch(`/accounts/instructor-profiles/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
