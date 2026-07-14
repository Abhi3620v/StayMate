import axiosInstance from '../utils/axiosInstance';

export const propertyService = {
  /**
   * Fetch paginated list of properties with filter parameters
   */
  getProperties: async (params = {}) => {
    const response = await axiosInstance.get('/properties', { params });
    return response.data;
  },

  /**
   * Retrieve single property details by ID
   */
  getProperty: async (id) => {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data.data;
  },

  /**
   * Create a new property listing (draft or published)
   */
  createProperty: async (payload) => {
    const response = await axiosInstance.post('/properties', payload);
    return response.data.data;
  },

  /**
   * Update listing details
   */
  updateProperty: async (id, payload) => {
    const response = await axiosInstance.put(`/properties/${id}`, payload);
    return response.data.data;
  },

  /**
   * Soft deletes / archives listing
   */
  deleteProperty: async (id) => {
    const response = await axiosInstance.delete(`/properties/${id}`);
    return response.data;
  },

  /**
   * Clones a listing to create a duplicate draft
   */
  duplicateProperty: async (id) => {
    const response = await axiosInstance.post(`/properties/${id}/duplicate`);
    return response.data.data;
  },

  /**
   * View owner properties dashboard
   */
  getOwnerProperties: async () => {
    const response = await axiosInstance.get('/properties/owner/listings');
    return response.data.data;
  },

  /**
   * Toggle saved status of listing
   */
  toggleWishlist: async (id) => {
    const response = await axiosInstance.post(`/properties/${id}/wishlist`);
    return response.data;
  },

  /**
   * Get user's saved wishlist
   */
  getWishlist: async () => {
    const response = await axiosInstance.get('/properties/user/wishlist');
    return response.data.data;
  },

  /**
   * Request property tour visit booking
   */
  requestVisit: async (payload) => {
    const response = await axiosInstance.post('/properties/user/visits', payload);
    return response.data.data;
  },

  /**
   * View visit booking tables (Tenant or Landlord logs)
   */
  getVisits: async () => {
    const response = await axiosInstance.get('/properties/user/visits');
    return response.data.data;
  },

  /**
   * Approve/Reject/Reschedule visit request (Landlord controls)
   */
  updateVisit: async (id, payload) => {
    const response = await axiosInstance.patch(`/properties/user/visits/${id}`, payload);
    return response.data.data;
  },
};

export default propertyService;
