import axiosInstance from '@/utils/axiosInstance';

export const paymentService = {
  createOrder: async (propertyId, amount, paymentType = 'booking_deposit') => {
    const response = await axiosInstance.post('/payments/orders', {
      propertyId,
      amount,
      paymentType
    });
    return response.data;
  },

  verifyPayment: async (orderId, paymentId, signature) => {
    const response = await axiosInstance.post('/payments/verify', {
      orderId,
      paymentId,
      signature
    });
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const response = await axiosInstance.get('/payments/transactions', { params });
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axiosInstance.get('/payments/analytics');
    return response.data;
  }
};

export default paymentService;
