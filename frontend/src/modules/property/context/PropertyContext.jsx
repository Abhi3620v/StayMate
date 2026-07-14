import React, { createContext, useContext, useState, useCallback } from 'react';
import propertyService from '../services/property.service.js';

const PropertyContext = createContext(null);

export const PropertyProvider = ({ children }) => {
  const [currentProperty, setCurrentProperty] = useState(null);
  const [draftProperty, setDraftProperty] = useState(null);
  const [ownerProperties, setOwnerProperties] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveTimestamp, setAutoSaveTimestamp] = useState(null);
  
  // Refined management states
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('propertyViewMode') || 'grid');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProperty, setDrawerProperty] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);

  // Moderation state additions
  const [reviewQueue, setReviewQueue] = useState([]);
  const [adminStats, setAdminStats] = useState({
    pendingReviews: 0,
    publishedProperties: 0,
    suspendedProperties: 0,
    softDeletedProperties: 0,
    approvalRate: 0,
    rejectionRate: 0,
    totalProperties: 0
  });
  const [ownerHistory, setOwnerHistory] = useState(null);

  // Analytics state additions
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [singlePropertyAnalytics, setSinglePropertyAnalytics] = useState(null);

  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    listingType: '',
    status: '',
    searchQuery: '',
    sortBy: 'newest',
    limit: 20,
    skip: 0
  });

  const [loadingStates, setLoadingStates] = useState({
    fetchingListings: false,
    fetchingDetail: false,
    savingProperty: false,
    publishing: false,
    duplicating: false,
    uploadingImages: false,
    fetchingAnalytics: false,
    fetchingTimeline: false,
    bulkOperating: false,
    fetchingQueue: false,
    reviewing: false
  });

  const [errorStates, setErrorStates] = useState({
    listingsError: null,
    detailError: null,
    saveError: null,
    uploadError: null,
    analyticsError: null
  });

  const updateLoadingState = useCallback((key, val) => {
    setLoadingStates(prev => ({ ...prev, [key]: val }));
  }, []);

  const updateErrorState = useCallback((key, val) => {
    setErrorStates(prev => ({ ...prev, [key]: val }));
  }, []);

  // Fetch owner listings
  const fetchOwnerProperties = useCallback(async () => {
    updateLoadingState('fetchingListings', true);
    updateErrorState('listingsError', null);
    try {
      const response = await propertyService.getOwnerProperties();
      setOwnerProperties(response.data || []);
    } catch (err) {
      updateErrorState('listingsError', err.message || 'Failed to fetch owner listings');
    } finally {
      updateLoadingState('fetchingListings', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Fetch single property listing
  const fetchPropertyDetail = useCallback(async (id) => {
    updateLoadingState('fetchingDetail', true);
    updateErrorState('detailError', null);
    try {
      const response = await propertyService.getProperty(id);
      setCurrentProperty(response.data);
      return response.data;
    } catch (err) {
      updateErrorState('detailError', err.message || 'Failed to load property details');
      throw err;
    } finally {
      updateLoadingState('fetchingDetail', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Fetch timeline logs
  const fetchPropertyTimeline = useCallback(async (id) => {
    updateLoadingState('fetchingTimeline', true);
    try {
      const response = await propertyService.getPropertyTimeline(id);
      setTimelineLogs(response.data || []);
      return response.data;
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      updateLoadingState('fetchingTimeline', false);
    }
  }, [updateLoadingState]);

  // Create property listing
  const createProperty = useCallback(async (propertyData) => {
    updateLoadingState('savingProperty', true);
    updateErrorState('saveError', null);
    try {
      const response = await propertyService.createProperty(propertyData);
      setDraftProperty(response.data);
      setAutoSaveTimestamp(new Date());
      return response.data;
    } catch (err) {
      updateErrorState('saveError', err.message || 'Failed to create property');
      throw err;
    } finally {
      updateLoadingState('savingProperty', false);
    }
  }, [updateLoadingState, updateErrorState]);

  // Update listing details
  const updateProperty = useCallback(async (id, propertyData) => {
    updateLoadingState('savingProperty', true);
    updateErrorState('saveError', null);
    try {
      const response = await propertyService.updateProperty(id, propertyData);
      setDraftProperty(response.data);
      setAutoSaveTimestamp(new Date());
      if (currentProperty && currentProperty._id === id) {
        setCurrentProperty(response.data);
      }
      return response.data;
    } catch (err) {
      updateErrorState('saveError', err.message || 'Failed to save property details');
      throw err;
    } finally {
      updateLoadingState('savingProperty', false);
    }
  }, [currentProperty, updateLoadingState, updateErrorState]);

  // Publish listing
  const publishProperty = useCallback(async (id) => {
    updateLoadingState('publishing', true);
    try {
      const response = await propertyService.publishProperty(id);
      setDraftProperty(null);
      await fetchOwnerProperties();
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      updateLoadingState('publishing', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  // Duplicate listing
  const duplicateProperty = useCallback(async (id) => {
    updateLoadingState('duplicating', true);
    try {
      const response = await propertyService.duplicateProperty(id);
      await fetchOwnerProperties();
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      updateLoadingState('duplicating', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  // Soft delete / discard draft
  const discardDraft = useCallback(async (id) => {
    updateLoadingState('savingProperty', true);
    try {
      await propertyService.softDeleteProperty(id);
      setDraftProperty(null);
      setCurrentStep(1);
      await fetchOwnerProperties();
    } catch (err) {
      throw err;
    } finally {
      updateLoadingState('savingProperty', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  // Restore soft deleted listing
  const restoreProperty = useCallback(async (id) => {
    updateLoadingState('savingProperty', true);
    try {
      const response = await propertyService.restoreProperty(id);
      await fetchOwnerProperties();
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      updateLoadingState('savingProperty', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  // Upload images
  const uploadImages = useCallback(async (id, formData, onProgress = null) => {
    updateLoadingState('uploadingImages', true);
    updateErrorState('uploadError', null);
    try {
      const response = await propertyService.uploadImages(id, formData, onProgress);
      if (draftProperty && draftProperty._id === id) {
        setDraftProperty(prev => ({
          ...prev,
          images: response.data
        }));
      }
      return response.data;
    } catch (err) {
      updateErrorState('uploadError', err.message || 'Failed to upload images');
      throw err;
    } finally {
      updateLoadingState('uploadingImages', false);
    }
  }, [draftProperty, updateLoadingState, updateErrorState]);

  // Update availability details
  const updateAvailability = useCallback(async (id, availabilityData) => {
    updateLoadingState('savingProperty', true);
    try {
      const response = await propertyService.updateAvailability(id, availabilityData);
      await fetchOwnerProperties();
      if (drawerProperty && drawerProperty._id === id) {
        setDrawerProperty(response.data);
      }
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      updateLoadingState('savingProperty', false);
    }
  }, [drawerProperty, fetchOwnerProperties, updateLoadingState]);

  // Bulk Operations
  const bulkArchive = useCallback(async (ids) => {
    updateLoadingState('bulkOperating', true);
    try {
      await propertyService.bulkArchive(ids);
      setSelectedProperties([]);
      await fetchOwnerProperties();
    } catch (err) {
      console.error('Bulk archive failed:', err);
    } finally {
      updateLoadingState('bulkOperating', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  const bulkRestore = useCallback(async (ids) => {
    updateLoadingState('bulkOperating', true);
    try {
      await propertyService.bulkRestore(ids);
      setSelectedProperties([]);
      await fetchOwnerProperties();
    } catch (err) {
      console.error('Bulk restore failed:', err);
    } finally {
      updateLoadingState('bulkOperating', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  const bulkDelete = useCallback(async (ids) => {
    updateLoadingState('bulkOperating', true);
    try {
      await propertyService.bulkDelete(ids);
      setSelectedProperties([]);
      await fetchOwnerProperties();
    } catch (err) {
      console.error('Bulk delete failed:', err);
    } finally {
      updateLoadingState('bulkOperating', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  const bulkSubmit = useCallback(async (ids) => {
    updateLoadingState('bulkOperating', true);
    try {
      await propertyService.bulkSubmit(ids);
      setSelectedProperties([]);
      await fetchOwnerProperties();
    } catch (err) {
      console.error('Bulk submit failed:', err);
    } finally {
      updateLoadingState('bulkOperating', false);
    }
  }, [fetchOwnerProperties, updateLoadingState]);

  // Admin moderation endpoints
  const fetchReviewQueue = useCallback(async () => {
    updateLoadingState('fetchingQueue', true);
    try {
      const response = await propertyService.getReviewQueue(filters);
      setReviewQueue(response.data || []);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      updateLoadingState('fetchingQueue', false);
    }
  }, [filters, updateLoadingState]);

  const fetchModerationStats = useCallback(async () => {
    try {
      const response = await propertyService.getModerationStats();
      setAdminStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const fetchOwnerHistory = useCallback(async (ownerId) => {
    try {
      const response = await propertyService.getOwnerHistory(ownerId);
      setOwnerHistory(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to load owner history:', err);
    }
  }, []);

  const reviewPropertyListing = useCallback(async (id, action, reviewData = {}) => {
    updateLoadingState('reviewing', true);
    try {
      const response = await propertyService.reviewProperty(id, { action, ...reviewData });
      await fetchReviewQueue();
      await fetchModerationStats();
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      updateLoadingState('reviewing', false);
    }
  }, [fetchReviewQueue, fetchModerationStats, updateLoadingState]);

  const bulkReviewListings = useCallback(async (ids, action, reviewData = {}) => {
    updateLoadingState('bulkOperating', true);
    try {
      await propertyService.bulkReview(ids, action, reviewData);
      setSelectedProperties([]);
      await fetchReviewQueue();
      await fetchModerationStats();
    } catch (err) {
      console.error('Bulk review failed:', err);
    } finally {
      updateLoadingState('bulkOperating', false);
    }
  }, [fetchReviewQueue, fetchModerationStats, updateLoadingState]);

  const fetchSinglePropertyAnalytics = useCallback(async (id) => {
    updateLoadingState('fetchingAnalytics', true);
    try {
      const response = await propertyService.getPropertyAnalytics(id);
      setSinglePropertyAnalytics(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch property analytics:', err);
    } finally {
      updateLoadingState('fetchingAnalytics', false);
    }
  }, [updateLoadingState]);

  const fetchPlatformAnalytics = useCallback(async () => {
    updateLoadingState('fetchingAnalytics', true);
    try {
      const response = await propertyService.getPlatformAnalytics();
      setPlatformAnalytics(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch platform analytics:', err);
    } finally {
      updateLoadingState('fetchingAnalytics', false);
    }
  }, [updateLoadingState]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next = prev === 'grid' ? 'table' : 'grid';
      localStorage.setItem('propertyViewMode', next);
      return next;
    });
  }, []);

  const value = {
    currentProperty,
    setCurrentProperty,
    draftProperty,
    setDraftProperty,
    ownerProperties,
    setOwnerProperties,
    currentStep,
    setCurrentStep,
    autoSaveTimestamp,
    setAutoSaveTimestamp,
    viewMode,
    toggleViewMode,
    selectedProperties,
    setSelectedProperties,
    drawerOpen,
    setDrawerOpen,
    drawerProperty,
    setDrawerProperty,
    timelineLogs,
    reviewQueue,
    adminStats,
    ownerHistory,
    filters,
    setFilters,
    loadingStates,
    errorStates,
    fetchOwnerProperties,
    fetchPropertyDetail,
    fetchPropertyTimeline,
    createProperty,
    updateProperty,
    publishProperty,
    duplicateProperty,
    discardDraft,
    restoreProperty,
    uploadImages,
    updateAvailability,
    bulkArchive,
    bulkRestore,
    bulkDelete,
    bulkSubmit,
    fetchReviewQueue,
    fetchModerationStats,
    fetchOwnerHistory,
    reviewPropertyListing,
    bulkReviewListings,
    platformAnalytics,
    singlePropertyAnalytics,
    fetchSinglePropertyAnalytics,
    fetchPlatformAnalytics
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
};
