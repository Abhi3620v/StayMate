import axiosInstance from '@/utils/axiosInstance';

export const locationService = {
  getAutocomplete: async (input) => {
    const res = await axiosInstance.get('/location/autocomplete', { params: { input } });
    return res.data;
  },

  geocode: async (address, placeId = null) => {
    const res = await axiosInstance.get('/location/geocode', { params: { address, placeId } });
    return res.data;
  },

  reverseGeocode: async (lat, lng) => {
    const res = await axiosInstance.get('/location/reverse-geocode', { params: { lat, lng } });
    return res.data;
  },

  getNearby: async (lat, lng) => {
    const res = await axiosInstance.get('/location/nearby', { params: { lat, lng } });
    return res.data;
  },

  logMetric: async (metricData) => {
    const res = await axiosInstance.post('/location/analytics/log', metricData);
    return res.data;
  },

  getOwnerAnalytics: async () => {
    const res = await axiosInstance.get('/location/analytics/owner');
    return res.data;
  },

  getAdminAnalytics: async () => {
    const res = await axiosInstance.get('/location/analytics/admin');
    return res.data;
  }
};

export default locationService;
