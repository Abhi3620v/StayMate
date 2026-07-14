import axiosInstance from '../../../utils/axiosInstance';

export const reviewService = {
  /**
   * Submit a verified review
   */
  createReview: async (payload) => {
    const response = await axiosInstance.post('/reviews', payload);
    return response.data.data;
  },

  /**
   * Update an existing review within 48h
   */
  updateReview: async (id, payload) => {
    const response = await axiosInstance.put(`/reviews/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete a review (soft-delete by user, hide by moderator)
   */
  deleteReview: async (id) => {
    const response = await axiosInstance.delete(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Add a threaded landlord/roommate response reply
   */
  addReply: async (id, content) => {
    const response = await axiosInstance.post(`/reviews/${id}/reply`, { content });
    return response.data.data;
  },

  /**
   * Cast a helpfulness upvote or downvote
   */
  vote: async (id, voteType) => {
    const response = await axiosInstance.post(`/reviews/${id}/vote`, { voteType });
    return response.data.data;
  },

  /**
   * Submit a safety flag report against a review
   */
  report: async (id, payload) => {
    const response = await axiosInstance.post(`/reviews/${id}/report`, payload);
    return response.data.data;
  },

  /**
   * List reviews with query filters
   */
  getReviews: async (params = {}) => {
    const response = await axiosInstance.get('/reviews', { params });
    return response.data;
  },

  /**
   * Aggregate stats and distribution summary
   */
  getStats: async (category, targetId) => {
    const response = await axiosInstance.get('/reviews/stats', {
      params: { category, targetId }
    });
    return response.data.data;
  },

  /**
   * Get dynamic reputation score of any user
   */
  getReputation: async (userId) => {
    const response = await axiosInstance.get(`/reviews/reputation/${userId}`);
    return response.data.data;
  },

  /**
   * Fetch flagged review reports (Admin Console)
   */
  getReports: async () => {
    const response = await axiosInstance.get('/reviews/reports');
    return response.data.data;
  },

  /**
   * Resolve flagged report (Admin Console)
   */
  resolveReport: async (reviewId, reportId, payload) => {
    const response = await axiosInstance.post(`/reviews/reports/${reviewId}/resolve/${reportId}`, payload);
    return response.data;
  }
};

export default reviewService;
