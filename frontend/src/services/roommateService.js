import axiosInstance from '../utils/axiosInstance';

export const roommateService = {
  /**
   * Fetch logged-in user's roommate profile
   */
  getMyProfile: async () => {
    const response = await axiosInstance.get('/roommates/me');
    return response.data.data;
  },

  /**
   * Create roommate profile
   */
  createProfile: async (payload) => {
    const response = await axiosInstance.post('/roommates', payload);
    return response.data.data;
  },

  /**
   * Update roommate profile
   */
  updateProfile: async (payload) => {
    const response = await axiosInstance.put('/roommates', payload);
    return response.data.data;
  },

  /**
   * Delete roommate profile
   */
  deleteProfile: async () => {
    const response = await axiosInstance.delete('/roommates');
    return response.data;
  },

  /**
   * Retrieve single roommate profile details by ID
   */
  getProfile: async (id) => {
    const response = await axiosInstance.get(`/roommates/${id}`);
    return response.data.data;
  },

  /**
   * Search/Discover matches with filters and sort settings
   */
  discoverMatches: async (params = {}) => {
    const response = await axiosInstance.get('/roommates', { params });
    return response.data;
  },

  /**
   * Send roommate connection request
   */
  sendRequest: async (payload) => {
    const response = await axiosInstance.post('/roommates/requests', payload);
    return response.data.data;
  },

  /**
   * Accept roommate request
   */
  acceptRequest: async (id) => {
    const response = await axiosInstance.post(`/roommates/requests/${id}/accept`);
    return response.data.data;
  },

  /**
   * Reject roommate request
   */
  rejectRequest: async (id) => {
    const response = await axiosInstance.post(`/roommates/requests/${id}/reject`);
    return response.data.data;
  },

  /**
   * Cancel sent request
   */
  cancelRequest: async (id) => {
    const response = await axiosInstance.post(`/roommates/requests/${id}/cancel`);
    return response.data.data;
  },

  /**
   * Unmatch / remove roommate connection
   */
  removeMatch: async (id) => {
    const response = await axiosInstance.delete(`/roommates/requests/${id}`);
    return response.data;
  },

  /**
   * Get matches console requests list and metrics
   */
  getRequests: async () => {
    const response = await axiosInstance.get('/roommates/requests');
    return response.data.data;
  },

  /**
   * Toggle saved status of roommate profile
   */
  toggleFavorite: async (id) => {
    const response = await axiosInstance.post(`/roommates/favorites/${id}`);
    return response.data.data;
  },

  /**
   * Get user's saved roommates list
   */
  getFavorites: async () => {
    const response = await axiosInstance.get('/roommates/favorites');
    return response.data.data;
  },

  /**
   * Get recently viewed roommate profiles
   */
  getRecentViews: async () => {
    const response = await axiosInstance.get('/roommates/views');
    return response.data.data;
  },

  /**
   * File safety / moderation report against profile
   */
  reportProfile: async (payload) => {
    const response = await axiosInstance.post('/roommates/reports', payload);
    return response.data;
  },

  /**
   * Admin: get flagged profiles
   */
  getReports: async () => {
    const response = await axiosInstance.get('/roommates/reports');
    return response.data.data;
  },

  /**
   * Admin: resolve flagged profile report
   */
  resolveReport: async (id, payload) => {
    const response = await axiosInstance.post(`/roommates/reports/${id}/resolve`, payload);
    return response.data.data;
  },
};

export default roommateService;
