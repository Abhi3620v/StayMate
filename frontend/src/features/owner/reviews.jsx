import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { Star, MessageSquare } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/index';
import toast from 'react-hot-toast';

const OwnerReviews = () => {
  const { user } = useAuth();
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsListLoading, setReviewsListLoading] = useState(false);
  const [reputationScore, setReputationScore] = useState(null);
  
  // Reply form state
  const [replyTextMap, setReplyTextMap] = useState({});
  const [submittingReplyId, setSubmittingReplyId] = useState(null);

  const fetchReviewsData = async () => {
    if (!user) return;
    setReviewsListLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const [repRes, reviewsRes] = await Promise.all([
        axios.get(`${baseUrl}/api/v1/reviews/reputation/${user?.id || user?._id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        }),
        axios.get(`${baseUrl}/api/v1/reviews?targetType=user&targetId=${user?.id || user?._id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
      ]);
      
      setReputationScore(repRes.data.data);
      setReviewsList(reviewsRes.data.data || []);
    } catch (err) {
      console.warn('Failed to retrieve reviews/reputation data:', err.message);
    } finally {
      setReviewsListLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [user]);

  const handleReplyChange = (reviewId, text) => {
    setReplyTextMap((prev) => ({ ...prev, [reviewId]: text }));
  };

  const handleReplySubmit = async (reviewId) => {
    const text = replyTextMap[reviewId];
    if (!text?.trim()) return;

    setSubmittingReplyId(reviewId);
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      await axios.post(
        `${baseUrl}/api/v1/reviews/${reviewId}/reply`,
        { reply: text },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      
      toast.success('Reply submitted successfully!');
      setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
      fetchReviewsData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit reply.');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardHeader 
        title="Reviews & Reputation" 
        subtitle="View your ratings, check reputation metrics, and reply to tenant visit reviews."
        breadcrumbs={['Dashboard', 'Reviews']}
      />

      {/* Reputation Score Metrics Card */}
      {reputationScore ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-secondary-200/50 flex flex-col justify-between hover:shadow-premium-md transition-all duration-300">
            <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider">Reputation Score</span>
            <h4 className="text-4xl font-black text-primary-700 dark:text-primary-400 mt-2">{reputationScore.score}/100</h4>
            <p className="text-[10px] text-secondary-450 mt-2">Calculated from verified tenant reviews & completed booking tours.</p>
          </Card>

          <Card className="p-6 border-secondary-200/50 flex flex-col justify-between hover:shadow-premium-md transition-all duration-300">
            <span className="text-[11px] font-bold text-success-600 uppercase tracking-wider">Trust Level</span>
            <h4 className="text-2xl font-black text-success-700 dark:text-success-400 mt-2 capitalize">{reputationScore.level}</h4>
            <p className="text-[10px] text-secondary-450 mt-2">Reflects host reliability status verified on the platform.</p>
          </Card>

          <Card className="p-6 border-secondary-200/50 flex flex-col justify-between hover:shadow-premium-md transition-all duration-300">
            <span className="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">Total Feedback Logs</span>
            <h4 className="text-4xl font-black text-secondary-800 dark:text-white mt-2">{reviewsList.length} Reviews</h4>
            <p className="text-[10px] text-secondary-450 mt-2">Aggregated rating metrics submitted by visiting tenants.</p>
          </Card>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-secondary-400 animate-pulse bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
          Retrieving reputation metric score...
        </div>
      )}

      {/* Reviews List */}
      <Card className="p-6 border-secondary-200/50 space-y-6">
        <div className="border-b border-secondary-100 dark:border-secondary-900 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-secondary-900 dark:text-white">Tenant Visits Feedback</h3>
            <p className="text-xs text-secondary-450 mt-0.5">Reviews submitted after visit requests</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-100 dark:bg-secondary-900 text-secondary-650 dark:text-secondary-400 text-[10px] font-bold">
            {reviewsList.length} feedback entries
          </span>
        </div>

        {reviewsListLoading ? (
          <div className="py-12 text-center text-xs text-secondary-400 animate-pulse">
            Loading received reviews...
          </div>
        ) : reviewsList.length === 0 ? (
          <div className="py-12 text-center text-xs text-secondary-450 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-2xl space-y-2">
            <MessageSquare className="h-8 w-8 text-secondary-300 mx-auto" />
            <p className="font-semibold text-sm">No reviews received yet</p>
            <p className="text-[10px] text-secondary-400 max-w-sm mx-auto">Reviews from potential flatmates and visitors will appear here once tour schedules are completed.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100 dark:divide-secondary-900/60 space-y-6">
            {reviewsList.map((rev) => (
              <div key={rev._id} className="pt-6 first:pt-0 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar src={rev.authorId?.avatar} name={rev.authorId?.name} size="md" />
                    <div>
                      <span className="font-extrabold text-sm text-secondary-900 dark:text-white block">{rev.authorId?.name}</span>
                      <span className="text-[10px] text-secondary-450 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-secondary-200 dark:text-secondary-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-secondary-50/50 dark:bg-secondary-900/20 p-4 rounded-2xl border border-secondary-200/40 dark:border-secondary-900/40">
                  <p className="text-xs text-secondary-750 dark:text-secondary-300 font-medium italic leading-relaxed">
                    "{rev.comment || 'No comment provided.'}"
                  </p>
                </div>

                {/* Reply display or form */}
                {rev.reply ? (
                  <div className="ml-8 p-4 bg-primary-50/30 dark:bg-primary-950/5 border border-primary-100/50 dark:border-primary-900/40 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-primary-650 dark:text-primary-400 block">Your Reply:</span>
                    <p className="text-xs text-secondary-750 dark:text-secondary-450 font-medium italic">"{rev.reply}"</p>
                  </div>
                ) : (
                  <div className="ml-8 space-y-3">
                    <Textarea
                      placeholder="Write a response to this tenant feedback..."
                      value={replyTextMap[rev._id] || ''}
                      onChange={(e) => handleReplyChange(rev._id, e.target.value)}
                      className="text-xs min-h-[70px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleReplySubmit(rev._id)}
                        isLoading={submittingReplyId === rev._id}
                        disabled={!replyTextMap[rev._id]?.trim()}
                        className="font-bold text-xs"
                      >
                        Submit Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OwnerReviews;
