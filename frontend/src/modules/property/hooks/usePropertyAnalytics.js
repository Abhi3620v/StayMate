import { useState } from 'react';
import propertyService from '../services/property.service.js';

export const usePropertyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await propertyService.getPropertyAnalytics(id);
      setAnalytics(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch property analytics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analytics,
    isLoading,
    error,
    fetchAnalytics
  };
};

export default usePropertyAnalytics;
