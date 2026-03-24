import api from './api';

export const getNotifications = () => api.get('/notifications/');
export const getUnreadCount = () => api.get('/notifications/unread-count/');
export const markAsRead = (id) => api.post(`/notifications/${id}/mark-read/`);
export const markAllAsRead = () => api.post('/notifications/mark-all-read/');