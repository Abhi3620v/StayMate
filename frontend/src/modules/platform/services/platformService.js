import axiosInstance from '@/utils/axiosInstance';

export const platformService = {
  search: async (q, category = 'all') => {
    const response = await axiosInstance.get('/platform/search', { params: { q, category } });
    return response.data;
  },

  getHealth: async () => {
    const response = await axiosInstance.get('/platform/health');
    return response.data;
  },

  getJobs: async () => {
    const response = await axiosInstance.get('/platform/jobs');
    return response.data;
  },

  runJob: async (name) => {
    const response = await axiosInstance.post(`/platform/jobs/${name}/run`);
    return response.data;
  },

  getCacheStats: async () => {
    const response = await axiosInstance.get('/platform/cache/stats');
    return response.data;
  },

  purgeCache: async () => {
    const response = await axiosInstance.post('/platform/cache/purge');
    return response.data;
  },

  getAudits: async (params = {}) => {
    const response = await axiosInstance.get('/platform/audits', { params });
    return response.data;
  },

  getPerformanceLogs: async () => {
    const response = await axiosInstance.get('/platform/performance');
    return response.data;
  },

  getErrorLogs: async () => {
    const response = await axiosInstance.get('/platform/errors');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axiosInstance.get('/platform/analytics');
    return response.data;
  }
};

export default platformService;
