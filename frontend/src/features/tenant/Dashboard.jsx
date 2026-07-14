import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import propertyService from '@/services/propertyService';
import roommateService from '@/services/roommateService';
import { useAuth } from '@/context/AuthContext';
import {
  DashboardHeader, DashboardStats, MetricCard, SectionHeader,
  DataTable, EmptyState, StatusBadge, ActivityFeed, QuickActions
} from '@/components/dashboard/index';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { Heart, Calendar, MessageSquare, Users, Shield, MapPin, Eye, Home, Compass } from 'lucide-react';
import axios from 'axios';

export const TenantDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [wishlist, setWishlist] = useState([]);
  const [visits, setVisits] = useState([]);
  const [hasRoommateProfile, setHasRoommateProfile] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [wishlistData, visitsData, roommateProfileData, roommateRequestsData] = await Promise.all([
        propertyService.getWishlist(),
        propertyService.getVisits(),
        roommateService.getMyProfile().catch(() => null),
        roommateService.getRequests().catch(() => null)
      ]);
      setWishlist(wishlistData || []);
      setVisits(visitsData || []);
      setHasRoommateProfile(!!roommateProfileData);

      if (roommateRequestsData && roommateRequestsData.stats) {
        setMatchCount(roommateRequestsData.stats.totalMatches || 0);
      } else if (Array.isArray(roommateRequestsData)) {
        const accepted = roommateRequestsData.filter(r => r.status === 'accepted');
        setMatchCount(accepted.length);
      }

      // Fetch dynamic reputation score
      const token = localStorage.getItem('accessToken');
      const repResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')}/api/v1/reviews/reputation/${user?.id || user?._id}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      setReputation(repResponse.data.data);
    } catch (err) {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Welcome back';
    if (hours < 17) return 'Welcome back';
    return 'Welcome back';
  };

  const lastLoginString = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const pendingVisitsCount = visits.filter(v => v.status === 'pending').length;
  const approvedVisitsCount = visits.filter(v => v.status === 'approved').length;

  const quickActions = [
    { label: 'Browse Properties', icon: Compass,  onClick: () => navigate('/properties') },
    { label: 'Wishlist',          icon: Heart,    onClick: () => navigate('/tenant/wishlist') },
    { label: 'Visit Requests',    icon: Calendar, onClick: () => navigate('/tenant/visits') },
    { label: 'Roommate Finder',   icon: Users,    onClick: () => navigate(hasRoommateProfile ? '/roommates/dashboard' : '/roommates') },
  ];

  const activities = [
    { description: 'Matching preferences are active', time: '2 hrs ago', icon: <Users className="h-3.5 w-3.5 text-indigo-500" /> },
    { description: `Saved ${wishlist.length} stays in your wishlist`, time: 'Today', icon: <Heart className="h-3.5 w-3.5 text-rose-500" /> },
    { description: 'Sent visit tour request to landlord', time: 'Yesterday', icon: <Calendar className="h-3.5 w-3.5 text-primary-500" /> },
  ];

  /* ── Loading skeleton matching the final layout structure ── */
  if (loading) {
    return (
      <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-2">
        <div className="h-[72px] bg-secondary-100 dark:bg-secondary-900/60 rounded-[18px] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[128px] bg-secondary-100 dark:bg-secondary-900/60 rounded-[18px] animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-secondary-100 dark:bg-secondary-900/60 rounded-[18px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-2">
      {/* ═══ Section 1: Welcome Header ═══ */}
      <DashboardHeader
        title={`${getGreeting()}, ${user?.name.split(' ')[0]}!`}
        subtitle="Track your wishlist, upcoming visits, roommate preferences, and chat threads."
        roleBadge="Tenant Console"
        breadcrumbs={['Console', 'Tenant Dashboard']}
        actions={
          <div className="bg-white dark:bg-secondary-900/50 border border-secondary-200/50 dark:border-secondary-800 rounded-xl px-4 py-2 text-left">
            <span className="text-[9px] text-secondary-450 dark:text-secondary-400 block font-bold uppercase tracking-wider">Session Info</span>
            <span className="text-xs font-black block mt-0.5 text-secondary-900 dark:text-white">{lastLoginString}</span>
          </div>
        }
      />

      {/* ═══ Section 2: Metrics Grid ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Saved Properties"
          value={wishlist.length}
          icon={<Heart className="h-5 w-5 text-rose-500" />}
          desc={wishlist.length > 0 ? 'Active wishlist items' : 'No saved stays yet'}
          onClick={() => navigate('/tenant/wishlist')}
        />
        <MetricCard
          title="Total Visit Bookings"
          value={visits.length}
          icon={<Calendar className="h-5 w-5 text-primary-500" />}
          desc={`${pendingVisitsCount} pending, ${approvedVisitsCount} approved`}
          onClick={() => navigate('/tenant/visits')}
        />
        <MetricCard
          title="Roommate Matching"
          value={
            !hasRoommateProfile
              ? "Setup"
              : (matchCount > 0 ? `${matchCount} ${matchCount === 1 ? 'Match' : 'Matches'}` : "Active")
          }
          icon={<Users className="h-5 w-5 text-indigo-500" />}
          desc={
            !hasRoommateProfile
              ? "Click to setup profile"
              : `${matchCount} active match${matchCount === 1 ? '' : 'es'}`
          }
          onClick={() => navigate(hasRoommateProfile ? '/roommates/dashboard' : '/roommates')}
        />
        <MetricCard
          title="Active Chats"
          value="Chat Live"
          icon={<MessageSquare className="h-5 w-5 text-amber-500" />}
          desc="Message hosts directly"
          onClick={() => navigate('/tenant/chat')}
        />
        <MetricCard
          title="Reputation Score"
          value={reputation ? `${reputation.score}/100` : 'Calculating...'}
          icon={<Shield className="h-5 w-5 text-success-500" />}
          desc={reputation ? `${reputation.level} Trust Level` : 'Calculating trust'}
          onClick={() => navigate('/profile')}
        />
      </div>

      {/* ═══ Section 5: Recent Activity Feed ═══ */}
      <div className="space-y-4">
        <SectionHeader 
          title="Recent Activity" 
          description="Real-time log of roommate preference matching and saves"
        />
        <ActivityFeed items={activities} />
      </div>
    </div>
  );
};

export default TenantDashboard;
