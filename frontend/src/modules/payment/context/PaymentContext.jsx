import React, { createContext, useContext, useState, useCallback } from 'react';
import paymentService from '../services/paymentService';
import toast from 'react-hot-toast';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await paymentService.getTransactions(params);
      setTransactions(res.data?.items || []);
      setTotalTransactions(res.data?.total || 0);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to retrieve transactions history.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAnalytics();
      setAnalytics(res.data || null);
    } catch (err) {
      // Fail silently for non-admins
    } finally {
      setLoading(false);
    }
  }, []);

  const initiateOrder = useCallback(async (propertyId, amount, paymentType) => {
    try {
      const res = await paymentService.createOrder(propertyId, amount, paymentType);
      return res.data; // { orderId, amount, currency, transactionId, keyId }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate checkout order.');
      throw err;
    }
  }, []);

  const verifySignature = useCallback(async (orderId, paymentId, signature) => {
    const loader = toast.loading('Verifying secure transaction signature...');
    try {
      const res = await paymentService.verifyPayment(orderId, paymentId, signature);
      toast.success('Payment verified successfully!', { id: loader });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment signature verification failed.', { id: loader });
      throw err;
    }
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        transactions,
        totalTransactions,
        analytics,
        loading,
        error,
        fetchTransactions,
        fetchAnalytics,
        initiateOrder,
        verifySignature
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
