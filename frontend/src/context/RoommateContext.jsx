import React, { createContext, useContext, useState, useEffect } from 'react';
import roommateService from '../services/roommateService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const RoommateContext = createContext(null);

export const useRoommate = () => {
  const context = useContext(RoommateContext);
  if (!context) {
    throw new Error('useRoommate must be used within a RoommateProvider');
  }
  return context;
};

export const RoommateProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Profile states
  const [profile, setProfile] = useState(null);
  const [myProfileLoading, setMyProfileLoading] = useState(false);

  // Discovery matches states
  const [discoveryMatches, setDiscoveryMatches] = useState([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 12 });

  // Filter states
  const defaultFilters = {
    gender: '',
    occupation: '',
    city: '',
    maxRent: '',
    smoking: '',
    drinking: '',
    pets: '',
    foodPreference: '',
    language: '',
    minCompatibility: '',
    sort: 'compatibility',
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');

  // Dashboard / Matches states
  const [dashboardData, setDashboardData] = useState({
    stats: { totalMatches: 0, pendingReceived: 0, pendingSent: 0, rejectedReceived: 0 },
    pendingRequests: [],
    sentRequests: [],
    acceptedMatches: [],
    rejectedRequests: [],
    recentActivity: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Favorites & History states
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [recentViews, setRecentViews] = useState([]);
  const [recentViewsLoading, setRecentViewsLoading] = useState(false);

  // Fetch current user's profile on auth
  const fetchMyProfile = async () => {
    if (!isAuthenticated || !user || user.role === 'guest') return;
    setMyProfileLoading(true);
    try {
      const data = await roommateService.getMyProfile();
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching roommate profile:', err.message);
      setProfile(null);
    } finally {
      setMyProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'guest') {
      fetchMyProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated, user]);

  // Profile CRUD operations
  const createMyProfile = async (profileData) => {
    setMyProfileLoading(true);
    try {
      const data = await roommateService.createProfile(profileData);
      setProfile(data);
      toast.success('Roommate profile created successfully!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create profile';
      toast.error(msg);
      throw err;
    } finally {
      setMyProfileLoading(false);
    }
  };

  const updateMyProfile = async (profileData) => {
    setMyProfileLoading(true);
    try {
      const data = await roommateService.updateProfile(profileData);
      setProfile(data);
      toast.success('Roommate profile updated successfully!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update profile';
      toast.error(msg);
      throw err;
    } finally {
      setMyProfileLoading(false);
    }
  };

  const deleteMyProfile = async () => {
    setMyProfileLoading(true);
    try {
      await roommateService.deleteProfile();
      setProfile(null);
      toast.success('Roommate profile deleted successfully.');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete profile';
      toast.error(msg);
      throw err;
    } finally {
      setMyProfileLoading(false);
    }
  };

  // Discovery matches feed
  const fetchDiscoveryMatches = async (page = 1) => {
    if (!isAuthenticated) return;
    setDiscoveryLoading(true);
    try {
      const queryParams = {
        ...filters,
        city: searchQuery ? searchQuery : filters.city,
        page,
        limit: 12,
      };

      // Clean empty keys
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await roommateService.discoverMatches(queryParams);
      setDiscoveryMatches(response.data || []);
      setPagination(response.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, limit: 12 });
    } catch (err) {
      console.error('Failed to discover matches:', err.message);
      toast.error('Failed to load roommate matches.');
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Dashboard requests
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    setDashboardLoading(true);
    try {
      const data = await roommateService.getRequests();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load roommate dashboard data:', err.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Connections / Requests actions
  const sendConnectionRequest = async (receiverId, message = '') => {
    try {
      const req = await roommateService.sendRequest({ receiverId, message });
      toast.success('Connection request sent!');
      fetchDashboardData();
      return req;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to send request';
      toast.error(msg);
      throw err;
    }
  };

  const acceptConnectionRequest = async (requestId) => {
    try {
      await roommateService.acceptRequest(requestId);
      toast.success('Connection request accepted!');
      fetchDashboardData();
      fetchMyProfile(); // Reload own profile matches if needed
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to accept request';
      toast.error(msg);
    }
  };

  const rejectConnectionRequest = async (requestId) => {
    try {
      await roommateService.rejectRequest(requestId);
      toast.success('Request rejected.');
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to reject request';
      toast.error(msg);
    }
  };

  const cancelConnectionRequest = async (requestId) => {
    try {
      await roommateService.cancelRequest(requestId);
      toast.success('Request cancelled.');
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to cancel request';
      toast.error(msg);
    }
  };

  const removeMatchConnection = async (requestId) => {
    try {
      await roommateService.removeMatch(requestId);
      toast.success('Match connection removed.');
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to remove connection';
      toast.error(msg);
    }
  };

  // Favorites
  const toggleFavoriteProfile = async (roommateId) => {
    try {
      const res = await roommateService.toggleFavorite(roommateId);
      if (res.isFavorite) {
        toast.success('Added to saved roommates');
      } else {
        toast.success('Removed from saved roommates');
      }
      fetchFavorites();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save profile';
      toast.error(msg);
    }
  };

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    setFavoritesLoading(true);
    try {
      const data = await roommateService.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error('Failed to load favorites:', err.message);
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Views History
  const fetchRecentViews = async () => {
    if (!isAuthenticated) return;
    setRecentViewsLoading(true);
    try {
      const data = await roommateService.getRecentViews();
      setRecentViews(data || []);
    } catch (err) {
      console.error('Failed to load recent views:', err.message);
    } finally {
      setRecentViewsLoading(false);
    }
  };

  // Report Profile
  const submitReport = async (roommateId, reason, description = '') => {
    try {
      await roommateService.reportProfile({ roommateId, reason, description });
      toast.success('Profile has been reported to administration.');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to file report';
      toast.error(msg);
      throw err;
    }
  };

  // Filters management
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
  };

  return (
    <RoommateContext.Provider
      value={{
        profile,
        myProfileLoading,
        fetchMyProfile,
        createMyProfile,
        updateMyProfile,
        deleteMyProfile,

        discoveryMatches,
        discoveryLoading,
        pagination,
        fetchDiscoveryMatches,

        filters,
        searchQuery,
        setSearchQuery,
        updateFilters,
        resetFilters,

        dashboardData,
        dashboardLoading,
        fetchDashboardData,
        sendConnectionRequest,
        acceptConnectionRequest,
        rejectConnectionRequest,
        cancelConnectionRequest,
        removeMatchConnection,

        favorites,
        favoritesLoading,
        toggleFavoriteProfile,
        fetchFavorites,

        recentViews,
        recentViewsLoading,
        fetchRecentViews,

        submitReport,
      }}
    >
      {children}
    </RoommateContext.Provider>
  );
};
export default RoommateContext;
