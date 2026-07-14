import React, { createContext, useContext, useState, useCallback } from 'react';
import platformService from '../services/platformService';
import toast from 'react-hot-toast';

const PlatformContext = createContext(null);

export const PlatformProvider = ({ children }) => {
  const [health, setHealth] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);
  const [audits, setAudits] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [performanceLogs, setPerformanceLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    properties: [],
    users: [],
    roommates: [],
    reviews: [],
    visitRequests: [],
    notifications: [],
    auditLogs: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformService.getHealth();
      setHealth(res.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await platformService.getJobs();
      setJobs(res.data || []);
    } catch (err) {
      // Fail silently
    }
  }, []);

  const triggerJob = useCallback(async (jobName) => {
    const loader = toast.loading(`Running background job ${jobName.replace('_', ' ')}...`);
    try {
      const res = await platformService.runJob(jobName);
      toast.success(`Job ${jobName.replace('_', ' ')} finished in ${res.data.duration}ms! Result: ${res.data.result}`, { id: loader });
      fetchJobs();
    } catch (err) {
      toast.error(`Job failed: ${err.message}`, { id: loader });
    }
  }, [fetchJobs]);

  const fetchCacheStats = useCallback(async () => {
    try {
      const res = await platformService.getCacheStats();
      setCacheStats(res.data || null);
    } catch (err) {
      // Fail silently
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await platformService.purgeCache();
      toast.success('Platform cache purged.');
      fetchCacheStats();
    } catch (err) {
      toast.error('Failed to clear cache.');
    }
  }, [fetchCacheStats]);

  const fetchAudits = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await platformService.getAudits(params);
      setAudits(res.data.items || []);
      setAuditTotal(res.data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformService.getPerformanceLogs();
      setPerformanceLogs(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformService.getErrorLogs();
      setErrorLogs(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformService.getAnalytics();
      setAnalytics(res.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (q, category = 'all') => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults({
        properties: [],
        users: [],
        roommates: [],
        reviews: [],
        visitRequests: [],
        notifications: [],
        auditLogs: []
      });
      return;
    }

    setLoading(true);
    try {
      const res = await platformService.search(q, category);
      setSearchResults(res.data || {});
    } catch (err) {
      toast.error('Search query failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PlatformContext.Provider
      value={{
        health,
        jobs,
        cacheStats,
        audits,
        auditTotal,
        performanceLogs,
        errorLogs,
        analytics,
        searchQuery,
        searchResults,
        loading,
        error,
        fetchHealth,
        fetchJobs,
        triggerJob,
        fetchCacheStats,
        clearCache,
        fetchAudits,
        fetchPerformance,
        fetchErrors,
        fetchAnalytics,
        performSearch
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};

export default PlatformContext;
