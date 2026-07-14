import axiosInstance from '@/utils/axiosInstance';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  getActivityFeed: async (params = {}) => {
    const response = await axiosInstance.get('/notifications/activity', { params });
    return response.data;
  },

  markRead: async (ids) => {
    const response = await axiosInstance.post('/notifications/read', { ids });
    return response.data;
  },

  markAllRead: async () => {
    const response = await axiosInstance.post('/notifications/read-all');
    return response.data;
  },

  archive: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/archive`);
    return response.data;
  },

  undoArchive: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/undo-archive`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },

  getPreferences: async () => {
    const response = await axiosInstance.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (payload) => {
    const response = await axiosInstance.put('/notifications/preferences', payload);
    return response.data;
  },

  broadcastAnnouncement: async (payload) => {
    const response = await axiosInstance.post('/notifications/broadcast', payload);
    return response.data;
  },

  getAnalyticsSummary: async () => {
    const response = await axiosInstance.get('/notifications/admin/analytics');
    return response.data;
  }
};

export default notificationService;
