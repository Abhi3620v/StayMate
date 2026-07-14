import React, { createContext, useContext, useState, useCallback } from 'react';
import reviewService from '../services/reviewService';
import toast from 'react-hot-toast';

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    sort: 'newest', // 'newest', 'oldest', 'highest', 'lowest', 'helpful'
    photosOnly: false,
    verifiedOnly: false,
  });

  const fetchReviews = useCallback(async (category, targetId, forcePage = null) => {
    setLoading(true);
    setError(null);
    try {
      const activePage = forcePage !== null ? forcePage : page;
      const targetParams = {
        category,
        sort: filters.sort,
        page: activePage,
        limit,
      };

      if (category === 'property') targetParams.propertyId = targetId;
      else if (category === 'owner') targetParams.ownerId = targetId;
      else if (category === 'roommate') targetParams.roommateId = targetId;

      if (filters.photosOnly) targetParams.photosOnly = 'true';
      if (filters.verifiedOnly) targetParams.verifiedOnly = 'true';

      const response = await reviewService.getReviews(targetParams);
      
      setReviews(response.items || []);
      setTotal(response.total || 0);
      if (forcePage !== null) setPage(forcePage);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  const fetchStats = useCallback(async (category, targetId) => {
    try {
      const data = await reviewService.getStats(category, targetId);
      setStats(data || { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    } catch (err) {
      console.warn('Failed to load reviews statistics:', err.message);
    }
  }, []);

  const submitReview = async (payload) => {
    setLoading(true);
    try {
      const newReview = await reviewService.createReview(payload);
      toast.success('Review submitted successfully!');
      
      // Refresh list and stats
      const targetId = payload.propertyId || payload.ownerId || payload.roommateId;
      fetchReviews(payload.category, targetId, 1);
      fetchStats(payload.category, targetId);
      return newReview;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to submit review.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editReview = async (id, payload, category, targetId) => {
    setLoading(true);
    try {
      const updated = await reviewService.updateReview(id, payload);
      toast.success('Review updated successfully!');
      fetchReviews(category, targetId, page);
      fetchStats(category, targetId);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update review.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id, category, targetId) => {
    setLoading(true);
    try {
      await reviewService.deleteReview(id);
      toast.success('Review removed successfully.');
      fetchReviews(category, targetId, 1);
      fetchStats(category, targetId);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete review.');
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (id, content, category, targetId) => {
    try {
      const updated = await reviewService.addReply(id, content);
      toast.success('Reply posted.');
      fetchReviews(category, targetId, page);
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit reply.');
      throw err;
    }
  };

  const submitVote = async (id, voteType, category, targetId) => {
    try {
      const updated = await reviewService.vote(id, voteType);
      
      // Update locally in reviews state to avoid full list refresh layout jump
      setReviews(prev => prev.map(r => r._id === id ? {
        ...r,
        votes: updated.votes,
        helpfulCount: updated.helpfulCount,
        notHelpfulCount: updated.notHelpfulCount
      } : r));
      
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to register vote.');
    }
  };

  const submitReport = async (id, payload) => {
    try {
      const updated = await reviewService.report(id, payload);
      toast.success('Review reported to site moderation.');
      
      setReviews(prev => prev.map(r => r._id === id ? {
        ...r,
        status: 'flagged',
        reports: updated.reports
      } : r));
      
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to report review.');
      throw err;
    }
  };

  const fetchReputation = async (userId) => {
    try {
      return await reviewService.getReputation(userId);
    } catch (err) {
      console.warn('Failed to load user reputation score:', err.message);
      return { score: 50, level: 'Fair' };
    }
  };

  const changeFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset page on filter changes
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        stats,
        loading,
        error,
        page,
        limit,
        total,
        filters,
        setPage,
        changeFilters,
        fetchReviews,
        fetchStats,
        submitReview,
        editReview,
        deleteReview,
        submitReply,
        submitVote,
        submitReport,
        fetchReputation
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};
