import { usePropertyContext } from '../context/PropertyContext.jsx';
import { useCallback, useMemo } from 'react';

export const useProperties = () => {
  const {
    ownerProperties,
    fetchOwnerProperties,
    createProperty,
    duplicateProperty,
    discardDraft,
    restoreProperty,
    bulkArchive,
    bulkRestore,
    bulkDelete,
    bulkSubmit,
    reviewQueue,
    adminStats,
    ownerHistory,
    fetchReviewQueue,
    fetchModerationStats,
    fetchOwnerHistory,
    reviewPropertyListing,
    bulkReviewListings,
    platformAnalytics,
    singlePropertyAnalytics,
    fetchSinglePropertyAnalytics,
    fetchPlatformAnalytics,
    filters,
    setFilters,
    viewMode,
    toggleViewMode,
    selectedProperties,
    setSelectedProperties,
    loadingStates,
    errorStates
  } = usePropertyContext();

  // 1. Filter and sort calculations (done on client-side cache for instant responsiveness)
  const processedProperties = useMemo(() => {
    let result = [...ownerProperties];

    // Search query match (title, city, area)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        (p.title || p.basicInfo?.title || '').toLowerCase().includes(query) ||
        (p.location?.city || '').toLowerCase().includes(query) ||
        (p.location?.area || '').toLowerCase().includes(query)
      );
    }

    // Dropdown filters
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.propertyType) {
      result = result.filter(p => p.propertyType === filters.propertyType);
    }
    if (filters.listingType) {
      result = result.filter(p => p.listingType === filters.listingType);
    }
    if (filters.city) {
      result = result.filter(p => p.location?.city === filters.city);
    }

    // Sort mappings
    result.sort((a, b) => {
      const aDate = new Date(a.metadata?.createdAt || a.createdAt || 0);
      const bDate = new Date(b.metadata?.createdAt || b.createdAt || 0);
      
      const aRent = a.pricing?.monthlyRent || 0;
      const bRent = b.pricing?.monthlyRent || 0;
      
      const aViews = a.statistics?.views || 0;
      const bViews = b.statistics?.views || 0;

      const aSaves = a.statistics?.favorites || 0;
      const bSaves = b.statistics?.favorites || 0;

      const aUpdated = new Date(a.metadata?.lastEditedAt || a.updatedAt || 0);
      const bUpdated = new Date(b.metadata?.lastEditedAt || b.updatedAt || 0);

      switch (filters.sortBy) {
        case 'oldest':
          return aDate - bDate;
        case 'highest_rent':
          return bRent - aRent;
        case 'lowest_rent':
          return aRent - bRent;
        case 'most_viewed':
          return bViews - aViews;
        case 'most_favorited':
          return bSaves - aSaves;
        case 'recently_updated':
          return bUpdated - aUpdated;
        case 'newest':
        default:
          return bDate - aDate;
      }
    });

    return result;
  }, [ownerProperties, filters]);

  // 2. Dashboard KPI Statistics calculations
  const statsKPIs = useMemo(() => {
    let views = 0;
    let saves = 0;
    let visitRequests = 0;
    let published = 0;
    let drafts = 0;
    let inReview = 0;
    let archived = 0;
    let rejected = 0;
    let suspended = 0;

    ownerProperties.forEach(p => {
      views += p.statistics?.views || 0;
      saves += p.statistics?.favorites || 0;
      visitRequests += p.statistics?.visitRequests || 0;

      if (p.status === 'published') published++;
      else if (p.status === 'draft') drafts++;
      else if (p.status === 'pending_review') inReview++;
      else if (p.status === 'archived') archived++;
      else if (p.status === 'rejected') rejected++;
      else if (p.status === 'suspended') suspended++;
    });

    return {
      total: ownerProperties.length,
      published,
      drafts,
      inReview,
      archived,
      rejected,
      suspended,
      views,
      saves,
      visitRequests
    };
  }, [ownerProperties]);

  // 3. Selection utilities
  const toggleSelect = useCallback((id) => {
    setSelectedProperties(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, [setSelectedProperties]);

  const selectAll = useCallback((checked, isReviewQueue = false) => {
    if (checked) {
      const list = isReviewQueue ? reviewQueue : processedProperties;
      setSelectedProperties(list.map(p => p._id));
    } else {
      setSelectedProperties([]);
    }
  }, [processedProperties, reviewQueue, setSelectedProperties]);

  return {
    properties: processedProperties,
    allPropertiesCache: ownerProperties,
    stats: statsKPIs,
    filters,
    setFilters,
    viewMode,
    toggleViewMode,
    selectedProperties,
    setSelectedProperties,
    toggleSelect,
    selectAll,
    isLoading: loadingStates.fetchingListings,
    bulkOperating: loadingStates.bulkOperating,
    error: errorStates.listingsError,
    fetchProperties: fetchOwnerProperties,
    createProperty,
    duplicateProperty,
    discardDraft,
    restoreProperty,
    bulkArchive,
    bulkRestore,
    bulkDelete,
    bulkSubmit,
    
    // Admin moderation operations
    reviewQueue,
    adminStats,
    ownerHistory,
    fetchReviewQueue,
    fetchModerationStats,
    fetchOwnerHistory,
    reviewPropertyListing,
    bulkReviewListings,
    isFetchingQueue: loadingStates.fetchingQueue,
    isReviewing: loadingStates.reviewing,

    // Analytics details
    platformAnalytics,
    singlePropertyAnalytics,
    fetchSinglePropertyAnalytics,
    fetchPlatformAnalytics,
    isFetchingAnalytics: loadingStates.fetchingAnalytics
  };
};

export default useProperties;
