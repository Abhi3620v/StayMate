import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import roommateService from '@/services/roommateService';
import { useRoommate } from '@/context/RoommateContext';
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from './components/ProfileHeader';
import CompatibilityBreakdown from './components/CompatibilityBreakdown';
import LifestyleTags from './components/LifestyleTags';
import ReportModal from './components/ReportModal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Calendar, Wallet, MapPin, Sparkles, BookOpen, Heart, ArrowLeft, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReviewProvider, useReview } from '@/modules/review/context/ReviewContext';
import RatingBreakdown from '@/modules/review/components/RatingBreakdown';
import ReviewFilters from '@/modules/review/components/ReviewFilters';
import ReviewCard from '@/modules/review/components/ReviewCard';
import ReviewForm from '@/modules/review/components/ReviewForm';
import RatingStars from '@/modules/review/components/RatingStars';

export const RoommateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    profile: myProfile,
    toggleFavoriteProfile,
    favorites,
    sendConnectionRequest,
    dashboardData,
    fetchDashboardData,
    cancelConnectionRequest,
    fetchFavorites,
  } = useRoommate();

  const [targetProfile, setTargetProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState({ score: 0, breakdown: {} });

  const [isReportOpen, setIsReportOpen] = useState(false);

  // Reviews states and hooks
  const { user } = useAuth();
  const { reviews, stats, loading: reviewsLoading, fetchReviews, fetchStats, filters, changeFilters, page, setPage, total, limit } = useReview();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews on mount
  useEffect(() => {
    if (targetProfile && targetProfile.userId) {
      const roommateUserId = targetProfile.userId._id || targetProfile.userId;
      fetchReviews('roommate', roommateUserId);
      fetchStats('roommate', roommateUserId);
    }
  }, [targetProfile, filters, page, fetchReviews, fetchStats]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await roommateService.getProfile(id);
      setTargetProfile(data);

      // If logged in user has a profile, fetch compatibility
      if (myProfile && String(myProfile._id) !== String(data._id)) {
        const compat = await roommateService.discoverMatches({
          minCompatibility: 0,
        });
        const matchedObj = compat.data?.find((rm) => String(rm._id) === String(data._id));
        if (matchedObj) {
          setCompatibility({
            score: matchedObj.compatibilityScore || 0,
            breakdown: matchedObj.compatibilityBreakdown || {},
          });
        }
      }
    } catch (err) {
      console.error('Failed to load roommate details:', err.message);
      toast.error('Roommate profile not found or private.');
      navigate('/roommates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchFavorites();
    fetchDashboardData();
  }, [id, myProfile]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">
        <div className="h-[220px] rounded-3xl bg-secondary-100 dark:bg-secondary-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-[400px] rounded-3xl bg-secondary-100 dark:bg-secondary-800" />
          <div className="h-[300px] rounded-3xl bg-secondary-100 dark:bg-secondary-800" />
        </div>
      </div>
    );
  }

  if (!targetProfile) return null;

  // Resolve matching connection request status
  const companionId = String(targetProfile.userId?._id || targetProfile.userId);
  const existingRequest = dashboardData.pendingRequests?.find((r) => String(r.senderId?._id) === companionId) ||
                          dashboardData.sentRequests?.find((r) => String(r.receiverId?._id) === companionId) ||
                          dashboardData.acceptedMatches?.find((m) => String(m.senderId?._id) === companionId || String(m.receiverId?._id) === companionId);

  let activeRequestStatus = 'none';
  let requestId = null;
  if (existingRequest) {
    activeRequestStatus = existingRequest.status;
    requestId = existingRequest._id;
  }

  const isMatched = activeRequestStatus === 'accepted';
  const hasReviewedMatch = existingRequest && reviews.some(r =>
    String(r.matchId) === String(existingRequest._id) && String(r.authorId?._id || r.authorId) === String(user?.id || user?._id)
  );

  const isFavorited = favorites.some((f) => String(f._id) === String(targetProfile._id));

  const handleToggleFavorite = () => {
    toggleFavoriteProfile(targetProfile._id);
  };

  const handleSendRequest = async (message) => {
    try {
      await sendConnectionRequest(companionId, message);
    } catch (err) {
      // Toast handles in context
    }
  };

  const handleCancelRequest = () => {
    if (requestId) {
      cancelConnectionRequest(requestId);
    }
  };

  const formattedDate = targetProfile.moveInDate
    ? new Date(targetProfile.moveInDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Flexible';

  const rentAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(targetProfile.budget?.monthlyRent || 0);

  const depositAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(targetProfile.budget?.securityDeposit || 0);

  const getStarRating = (score = 0, max = 1) => {
    const ratio = max > 0 ? score / max : 0;
    const starsCount = Math.max(1, Math.min(5, Math.round(ratio * 5)));
    return '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount);
  };

  const getMatchQualityLabel = (score) => {
    if (score >= 95) return 'Perfect Match';
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Very Good Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Average Match';
    return 'Low Match';
  };

  const getWhyThisMatch = () => {
    const points = [];
    const breakdown = compatibility.breakdown || {};
    
    if (breakdown.budget?.score >= 15) points.push('Similar Budget');
    if (breakdown.location?.score >= 15) points.push('Same City');
    if (breakdown.lifestyle?.score >= 25) points.push('Same Lifestyle');
    
    if (myProfile?.lifestyle?.foodPreference === targetProfile.lifestyle?.foodPreference) {
      points.push('Similar Food Preference');
    }
    
    const mutualLangs = myProfile?.languagesSpoken?.filter(l => targetProfile.languagesSpoken?.includes(l)) || [];
    if (mutualLangs.length > 0) {
      points.push('Same Language');
    }
    
    return points;
  };

  const getMutualInterests = () => {
    const list = [];
    // Hobbies
    const mutualHobbies = myProfile?.hobbies?.filter(h => targetProfile.hobbies?.includes(h)) || [];
    mutualHobbies.forEach(h => list.push(h));
    
    // Interests
    const mutualInterests = myProfile?.interests?.filter(i => targetProfile.interests?.includes(i)) || [];
    mutualInterests.forEach(i => list.push(i));
    
    // Languages
    const mutualLangs = myProfile?.languagesSpoken?.filter(l => targetProfile.languagesSpoken?.includes(l)) || [];
    mutualLangs.forEach(l => list.push(l));
    
    // Food
    if (myProfile?.lifestyle?.foodPreference === targetProfile.lifestyle?.foodPreference && myProfile?.lifestyle?.foodPreference !== 'any') {
      list.push(myProfile.lifestyle.foodPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian');
    }
    
    return list;
  };

  const whyThisMatchPoints = getWhyThisMatch();
  const mutualInterests = getMutualInterests();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Header Back controls */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-xs font-bold text-secondary-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1 shrink-0" />
          Back to discovery
        </button>
      </div>

      {/* Hero profile header component */}
      <ProfileHeader
        profile={targetProfile}
        compatibilityScore={myProfile && String(myProfile._id) !== String(targetProfile._id) ? compatibility.score : undefined}
        isFavorited={isFavorited}
        onToggleFavorite={handleToggleFavorite}
        onSendRequest={handleSendRequest}
        onReportClick={() => setIsReportOpen(true)}
        activeRequestStatus={activeRequestStatus}
        onCancelRequest={handleCancelRequest}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Bio, Lifestyle, Extras */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio section */}
          <Card className="p-6 md:p-8 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm">
            <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider mb-4">
              About Me
            </h3>
            <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed font-medium whitespace-pre-line">
              {targetProfile.basicInfo?.bio}
            </p>
          </Card>

          {/* Lifestyle Preferences details */}
          <Card className="p-6 md:p-8 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm">
            <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider mb-5">
              Lifestyle Habits
            </h3>
            <LifestyleTags lifestyle={targetProfile.lifestyle} />

            {/* Timings & Environment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-800/80 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
              <div className="bg-secondary-50/50 dark:bg-secondary-950/40 p-4 border border-secondary-200/40 dark:border-secondary-800/40 rounded-2xl space-y-2">
                <span className="text-[10px] text-secondary-400 dark:text-secondary-500 uppercase tracking-widest font-extrabold block">
                  Schedule Details
                </span>
                <p>
                  <span className="font-bold text-secondary-800 dark:text-secondary-200">Sleep Schedule:</span>{' '}
                  <span className="capitalize">{targetProfile.lifestyle?.sleepingSchedule?.replace('_', ' ')}</span>
                </p>
                <p>
                  <span className="font-bold text-secondary-800 dark:text-secondary-200">Wake-up Time:</span>{' '}
                  {targetProfile.lifestyle?.wakeUpTime}
                </p>
              </div>

              <div className="bg-secondary-50/50 dark:bg-secondary-950/40 p-4 border border-secondary-200/40 dark:border-secondary-800/40 rounded-2xl space-y-2">
                <span className="text-[10px] text-secondary-400 dark:text-secondary-500 uppercase tracking-widest font-extrabold block">
                  Environment details
                </span>
                <p>
                  <span className="font-bold text-secondary-800 dark:text-secondary-200">Study Preference:</span>{' '}
                  <span className="capitalize">{targetProfile.lifestyle?.studyEnvironment} room</span>
                </p>
                <p>
                  <span className="font-bold text-secondary-800 dark:text-secondary-200">Cleanliness:</span>{' '}
                  <span className="capitalize">{targetProfile.lifestyle?.cleanliness} tolerance</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Hobbies and Interests */}
          {(targetProfile.hobbies?.length > 0 || targetProfile.interests?.length > 0) && (
            <Card className="p-6 md:p-8 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm">
              <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider mb-5">
                Hobbies & Interests
              </h3>
              <div className="space-y-4">
                {targetProfile.hobbies?.length > 0 && (
                  <div>
                    <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-extrabold uppercase tracking-wider block mb-2">
                      Hobbies
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {targetProfile.hobbies.map((h) => (
                        <span key={h} className="px-3 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-semibold rounded-xl">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {targetProfile.interests?.length > 0 && (
                  <div>
                    <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-extrabold uppercase tracking-wider block mb-2">
                      Interests
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {targetProfile.interests.map((i) => (
                        <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-xl">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Mutual Interests Section */}
          {myProfile && String(myProfile._id) !== String(targetProfile._id) && mutualInterests.length > 0 && (
            <Card className="p-6 md:p-8 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm">
              <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider mb-4">
                Mutual Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {mutualInterests.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 bg-success-50 dark:bg-success-950/20 text-success-700 dark:text-success-400 border border-success-100/10 text-xs font-bold rounded-xl flex items-center space-x-1 select-none"
                  >
                    <span className="text-success-600 font-extrabold">✓</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Roommate Reviews & Ratings */}
          <div className="space-y-6 pt-6 border-t border-secondary-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-secondary-900 dark:text-white">
                  Roommate Reviews & Feedback
                </h3>
                <p className="text-xs text-secondary-400 mt-1">Trust recommendations from matched roommates.</p>
              </div>
              {isMatched && !hasReviewedMatch && !showReviewForm && (
                <Button
                  size="sm"
                  variant="primary"
                  className="font-bold py-2 text-[10px]"
                  onClick={() => setShowReviewForm(true)}
                >
                  Write a Review
                </Button>
              )}
            </div>

            {showReviewForm && existingRequest && (
              <Card className="p-5 border border-primary-100 bg-primary-50/5 dark:bg-secondary-950/20 rounded-3xl">
                <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white mb-4">Submit Roommate Review</h4>
                <ReviewForm
                  category="roommate"
                  targetId={companionId}
                  interactionId={existingRequest._id}
                  onSuccess={() => setShowReviewForm(false)}
                  onCancel={() => setShowReviewForm(false)}
                />
              </Card>
            )}

            {/* Breakdown summary */}
            {stats && stats.totalReviews > 0 ? (
              <RatingBreakdown stats={stats} />
            ) : (
              <div className="text-center py-6 border border-dashed rounded-2xl text-xs text-secondary-450 italic select-none">
                No roommate compatibility feedback yet. Matched companions can review each other.
              </div>
            )}

            {stats && stats.totalReviews > 0 && (
              <>
                {/* Filters */}
                <ReviewFilters filters={filters} onChange={changeFilters} />

                {/* List */}
                <div className="space-y-4">
                  {reviewsLoading ? (
                    [1, 2].map(i => (
                      <div key={i} className="h-32 bg-secondary-100 dark:bg-secondary-800 rounded-3xl animate-pulse" />
                    ))
                  ) : reviews.length > 0 ? (
                    reviews.map(review => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        category="roommate"
                        targetId={companionId}
                      />
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-secondary-405 italic">
                      No matching reviews found for current filter settings.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="flex justify-center items-center space-x-2 pt-2">
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-[10px] font-bold text-secondary-450">
                      Page {page} of {Math.ceil(total / limit)}
                    </span>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={page >= Math.ceil(total / limit)}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Compatibility, Budget details, Location */}
        <div className="space-y-6 lg:col-span-1">
          {/* Compatibility Breakdown (Only shown if logged-in user has profile) */}
          {myProfile && String(myProfile._id) !== String(targetProfile._id) ? (
            <Card className="p-6 md:p-8 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b border-secondary-100 dark:border-secondary-800">
                <Sparkles className="h-5 w-5 text-primary-650 animate-pulse" />
                <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">
                  Compatibility
                </h3>
              </div>
              
              {/* Match quality label & score */}
              <div className="text-center py-2 bg-secondary-50 dark:bg-secondary-950/45 rounded-2xl border border-secondary-200/40 dark:border-secondary-800/40">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 block">
                  {getMatchQualityLabel(compatibility.score)}
                </span>
                <span className="text-3xl font-black text-secondary-900 dark:text-white mt-1 block">
                  {compatibility.score}%
                </span>
              </div>

              {/* Star-based breakdown list */}
              <div className="space-y-3.5 text-xs font-semibold text-secondary-600 dark:text-secondary-400 pt-1">
                <div className="flex justify-between items-center">
                  <span>Budget</span>
                  <span className="text-amber-500 font-bold text-sm tracking-wider">
                    {getStarRating(compatibility.breakdown?.budget?.score, compatibility.breakdown?.budget?.max || 20)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lifestyle</span>
                  <span className="text-amber-500 font-bold text-sm tracking-wider">
                    {getStarRating(compatibility.breakdown?.lifestyle?.score, compatibility.breakdown?.lifestyle?.max || 35)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Location Target</span>
                  <span className="text-amber-500 font-bold text-sm tracking-wider">
                    {getStarRating(compatibility.breakdown?.location?.score, compatibility.breakdown?.location?.max || 20)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Languages spoken</span>
                  <span className="text-amber-500 font-bold text-sm tracking-wider">
                    {getStarRating(compatibility.breakdown?.language?.score, compatibility.breakdown?.language?.max || 10)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Move-in Date Target</span>
                  <span className="text-amber-500 font-bold text-sm tracking-wider">
                    {getStarRating(compatibility.breakdown?.moveInDate?.score, compatibility.breakdown?.moveInDate?.max || 5)}
                  </span>
                </div>
              </div>

              {/* Why This Match Recommendations checklist */}
              {whyThisMatchPoints.length > 0 && (
                <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 space-y-2.5">
                  <h4 className="text-[10px] font-black text-secondary-450 dark:text-secondary-500 uppercase tracking-widest block">
                    Why This Match?
                  </h4>
                  <ul className="space-y-1.5 font-bold text-xs text-secondary-650 dark:text-secondary-400 pl-0.5">
                    {whyThisMatchPoints.map((p, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="text-success-650 font-black">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ) : (
            /* Call to Action prompting match if not logged in / profile setup is missing */
            !myProfile && (
              <Card className="p-6 bg-gradient-to-br from-primary-600 to-indigo-650 text-white rounded-3xl border-none shadow-premium-md text-xs font-semibold space-y-3">
                <Sparkles className="h-6 w-6 animate-pulse" />
                <p className="font-extrabold text-sm tracking-tight">Compare Compatibility Details</p>
                <p className="text-primary-100 font-medium leading-relaxed">
                  Complete your roommate profile so our matching engine can calculate your compatibility scores across budget, location, and lifestyle parameters.
                </p>
                <Button variant="white" size="sm" className="w-full font-bold py-2 bg-white text-primary-700 hover:bg-primary-50" onClick={() => navigate('/roommates')}>
                  Setup My Profile
                </Button>
              </Card>
            )
          )}

          {/* Budget & Timeline preference card */}
          <Card className="p-6 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm text-xs font-semibold text-secondary-500 dark:text-secondary-400 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-secondary-100 dark:border-secondary-800">
              <Wallet className="h-4.5 w-4.5 text-secondary-400" />
              <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">
                Rent & Housing Target
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Monthly Budget:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{rentAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit Target:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{depositAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred Property Type:</span>
                <span className="font-bold text-secondary-900 dark:text-white capitalize">{targetProfile.budget?.propertyType}</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred Listing Type:</span>
                <span className="font-bold text-secondary-900 dark:text-white capitalize">{targetProfile.budget?.listingType}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-secondary-100 dark:border-secondary-800/80">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-secondary-400 shrink-0" />
                  Move-in Date:
                </span>
                <span className="font-bold text-secondary-900 dark:text-white">{formattedDate}</span>
              </div>
            </div>
          </Card>

          {/* Location Preferences card */}
          <Card className="p-6 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm text-xs font-semibold text-secondary-500 dark:text-secondary-400 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-secondary-100 dark:border-secondary-800">
              <MapPin className="h-4.5 w-4.5 text-secondary-400" />
              <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">
                Location Targets
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>City:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{targetProfile.locationPreferences?.city}</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred Sector/Area:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{targetProfile.locationPreferences?.area}</span>
              </div>
              <div className="flex justify-between">
                <span>Max distance from area:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{targetProfile.locationPreferences?.maxDistance} km</span>
              </div>
            </div>
          </Card>
          {/* Recent Activity Card */}
          {existingRequest && (
            <Card className="p-6 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl shadow-premium-sm text-xs font-semibold text-secondary-500 dark:text-secondary-400 space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-secondary-100 dark:border-secondary-800">
                <h3 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-secondary-800 dark:text-secondary-200">
                      Request status changed to <span className="capitalize text-primary-650">{existingRequest.status}</span>
                    </p>
                    <p className="text-[10px] text-secondary-400 mt-0.5">
                      Updated on {new Date(existingRequest.updatedAt || existingRequest.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Flag Report dialog modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        roommateId={targetProfile._id}
        roommateName={targetProfile.userId?.name}
      />
    </div>
  );
};

const RoommateDetailsWithReviews = () => (
  <ReviewProvider>
    <RoommateDetails />
  </ReviewProvider>
);

export default RoommateDetailsWithReviews;
