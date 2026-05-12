// src/services/experiences.js
import api from './api';

const URL = '/experiences/';

export const experiencesService = {
  getAll      : (params = {}) => api.get(URL, { params }),
  getById     : (id)          => api.get(`${URL}${id}/`),
  getContent  : (id)          => api.get(`${URL}${id}/content/`),
  buy         : (id)          => api.post(`${URL}${id}/buy/`),
  my_purchases: ()            => api.get(`${URL}my_purchases/`),
  my_created  : ()            => api.get(`${URL}my_created/`),

  // Admin
  pending     : ()  => api.get(`${URL}admin/pending/`),
  approve     : (id) => api.post(`${URL}${id}/approve/`),
  reject      : (id) => api.post(`${URL}${id}/reject/`),

  // CRUD
  create      : (data)     => api.post(URL, data, { headers:{'Content-Type':'multipart/form-data'} }),
  update      : (id, data) => api.patch(`${URL}${id}/`, data, { headers:{'Content-Type':'multipart/form-data'} }),
  updatePrice : (id, data) => api.patch(`${URL}${id}/update-price/`, data),
  toggleStatus: (id)       => api.patch(`${URL}${id}/toggle_status/`),
  delete      : (id)       => api.delete(`${URL}${id}/`),
};
