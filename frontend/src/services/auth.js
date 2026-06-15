import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/token/', { email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return { access, refresh };
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    const { access, refresh, user, pending_approval } = response.data;

    if (pending_approval) {
      // ✅ مدرس في انتظار موافقة الأدمن
      // نحفظ بيانات المستخدم فقط (بدون توكن) عشان نقدر نرفع الـ CV
      // التوكن موقت جداً — بس للـ Step 3 (رفع بيانات المدرس)
      localStorage.setItem('pending_token', access);
      localStorage.setItem('pending_refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      // لا نحفظ access_token — المدرس مش logged in بعد
    } else {
      // ✅ طالب عادي — logged in مباشرةً
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return { access, refresh, user, pending_approval };
  },

  // ✅ بعد ما المدرس يرفع الـ CV في Step 3 — نمسح الـ pending token
  clearPendingInstructor: () => {
    // ✅ امسح الـ tokens المؤقتة بس — مش الـ user
    localStorage.removeItem('pending_token');
    localStorage.removeItem('pending_refresh');
  },

  // ✅ الـ pending token للاستخدام في Step 3 فقط (رفع بيانات المدرس)
  getPendingToken: () => localStorage.getItem('pending_token'),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pending_token');
    localStorage.removeItem('pending_refresh');
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
    // ✅ pending_token وحده مش كافي — لازم access_token
    return !!localStorage.getItem('access_token');
  },

  isInstructor: () => {
    const user = authService.getUserFromStorage();
    return user?.is_instructor || false;
  },

  isPendingApproval: () => {
    return !!localStorage.getItem('pending_token') &&
           !localStorage.getItem('access_token');
  },
};