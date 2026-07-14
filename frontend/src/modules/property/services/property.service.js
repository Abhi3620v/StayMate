import axiosInstance from '../../../utils/axiosInstance.js';

class PropertyService {
  async getProperties(params = {}) {
    const response = await axiosInstance.get('/properties', { params });
    return response.data;
  }

  async getProperty(id) {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  }

  async createProperty(propertyData) {
    const response = await axiosInstance.post('/properties', propertyData);
    return response.data;
  }

  async updateProperty(id, propertyData) {
    const response = await axiosInstance.patch(`/properties/${id}`, propertyData);
    return response.data;
  }

  async publishProperty(id) {
    const response = await axiosInstance.post(`/properties/${id}/publish`);
    return response.data;
  }

  async archiveProperty(id) {
    const response = await axiosInstance.post(`/properties/${id}/archive`);
    return response.data;
  }

  async duplicateProperty(id) {
    const response = await axiosInstance.post(`/properties/${id}/duplicate`);
    return response.data;
  }

  async softDeleteProperty(id) {
    const response = await axiosInstance.delete(`/properties/${id}`);
    return response.data;
  }

  async restoreProperty(id) {
    const response = await axiosInstance.post(`/properties/${id}/restore`);
    return response.data;
  }

  async uploadImages(id, formData, onUploadProgress = null) {
    const response = await axiosInstance.post(`/properties/${id}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
    return response.data;
  }

  async updateAvailability(id, availabilityData) {
    const response = await axiosInstance.put(`/properties/${id}/availability`, availabilityData);
    return response.data;
  }

  async getPropertyTimeline(id) {
    const response = await axiosInstance.get(`/properties/${id}/timeline`);
    return response.data;
  }

  // Bulk operations
  async bulkArchive(ids) {
    const response = await axiosInstance.post('/properties/bulk/archive', { ids });
    return response.data;
  }

  async bulkRestore(ids) {
    const response = await axiosInstance.post('/properties/bulk/restore', { ids });
    return response.data;
  }

  async bulkDelete(ids) {
    const response = await axiosInstance.post('/properties/bulk/delete', { ids });
    return response.data;
  }

  async bulkSubmit(ids) {
    const response = await axiosInstance.post('/properties/bulk/submit', { ids });
    return response.data;
  }

  // Admin moderation endpoints
  async getReviewQueue(params = {}) {
    const response = await axiosInstance.get('/properties/moderation/queue', { params });
    return response.data;
  }

  async getModerationStats() {
    const response = await axiosInstance.get('/properties/moderation/stats');
    return response.data;
  }

  async getOwnerHistory(ownerId) {
    const response = await axiosInstance.get(`/properties/owner-history/${ownerId}`);
    return response.data;
  }

  async reviewProperty(id, reviewData) {
    const response = await axiosInstance.post(`/properties/${id}/review`, reviewData);
    return response.data;
  }

  async bulkReview(ids, action, reviewData = {}) {
    const response = await axiosInstance.post('/properties/bulk/review', { ids, action, ...reviewData });
    return response.data;
  }

  async getOwnerProperties() {
    const response = await axiosInstance.get('/properties/owner/listings');
    return response.data;
  }

  async getPropertyAnalytics(id) {
    const response = await axiosInstance.get(`/properties/${id}/analytics`);
    return response.data;
  }

  async getPlatformAnalytics() {
    const response = await axiosInstance.get('/properties/admin/analytics');
    return response.data;
  }
}

export default new PropertyService();
