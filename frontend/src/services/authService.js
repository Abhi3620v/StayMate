import axiosInstance from '../utils/axiosInstance';

/**
 * Service handling all outgoing authentication API requests
 */
export const authService = {
  register: async (payload) => {
    const response = await axiosInstance.post('/auth/register', payload);
    return response.data;
  },

  login: async (payload) => {
    const response = await axiosInstance.post('/auth/login', payload);
    return response.data.data;
  },

  googleLogin: async (idToken, role = 'tenant', isRegistering = false) => {
    const response = await axiosInstance.post('/auth/google', { idToken, role, isRegistering });
    return response.data.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await axiosInstance.post('/auth/reset-password', payload);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axiosInstance.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },

  changePassword: async (payload) => {
    const response = await axiosInstance.patch('/auth/change-password', payload);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data;
  },

  getSessions: async () => {
    const response = await axiosInstance.get('/auth/sessions');
    return response.data.data;
  },

  revokeSession: async (id) => {
    const response = await axiosInstance.delete(`/auth/sessions/${id}`);
    return response.data;
  },

  revokeAllSessions: async () => {
    const response = await axiosInstance.delete('/auth/sessions');
    return response.data;
  },

  getDevices: async () => {
    const response = await axiosInstance.get('/auth/devices');
    return response.data.data;
  },

  trustDevice: async (id) => {
    const response = await axiosInstance.post(`/auth/devices/${id}/trust`);
    return response.data;
  },

  renameDevice: async (id, deviceName) => {
    const response = await axiosInstance.patch(`/auth/devices/${id}`, { deviceName });
    return response.data;
  },

  removeDevice: async (id) => {
    const response = await axiosInstance.delete(`/auth/devices/${id}`);
    return response.data;
  }
};

export default authService;
