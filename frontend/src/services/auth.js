import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/token/', {
      email,
      password,
    });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return { access, refresh };
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    return { access, refresh, user };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/accounts/users/me/');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  },

  getUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  isInstructor: () => {
    const user = authService.getUserFromStorage();
    return user?.is_instructor || false;
  },
};
