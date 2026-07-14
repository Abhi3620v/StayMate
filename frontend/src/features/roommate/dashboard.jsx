import React, { useEffect, useState } from 'react';
import { useRoommate } from '@/context/RoommateContext';
import StatisticsCard from './components/StatisticsCard';
import RequestCard from './components/RequestCard';
import MatchCard from './components/MatchCard';
import ProfileTimeline from './components/ProfileTimeline';
import ProfileEditModal from './components/ProfileEditModal';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import { Users, UserCheck, Inbox, Send, Activity, Sparkles, Plus, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const RoommateDashboard = () => {
  const navigate = useNavigate();
  const {
    profile,
    myProfileLoading,
    dashboardData,
    dashboardLoading,
    fetchDashboardData,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    removeMatchConnection,
  } = useRoommate();

  const [activeTab, setActiveTab] = useState('matches');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUnmatch = (requestId, name) => {
    const confirm = window.confirm(`Are you sure you want to remove your roommate match connection with ${name}?`);
    if (confirm) {
      removeMatchConnection(requestId);
    }
  };

  const tabsConfig = [
    { id: 'matches', label: `My Matches (${dashboardData.acceptedMatches?.length || 0})`, icon: UserCheck },
    { id: 'received', label: `Received Requests (${dashboardData.pendingRequests?.length || 0})`, icon: Inbox },
    { id: 'sent', label: `Sent Requests (${dashboardData.sentRequests?.length || 0})`, icon: Send },
    { id: 'activity', label: 'Recent Activity', icon: Activity },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-secondary-200/60 dark:border-secondary-900/60">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/roommates')}
            className="flex items-center text-xs font-bold text-secondary-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1 shrink-0" />
            Back to Roommate Finder
          </button>
          <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white flex items-center tracking-tight mt-1">
            Roommate Matches Console
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">
            Manage your connection requests, matched roommates, and review incoming requests.
          </p>
        </div>

        {/* Profile CTA */}
        {profile ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold py-2.5 px-4.5 border-secondary-200 dark:border-secondary-800"
              onClick={() => navigate(`/roommates/${profile._id}`)}
            >
              View My Public Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold py-2.5 px-4.5"
              onClick={() => setIsEditProfileOpen(true)}
            >
              Edit Preferences
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="text-xs font-bold py-2.5 px-4.5 flex items-center space-x-1"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Setup Profile</span>
          </Button>
        )}
      </div>

      {/* Profile missing alert banner */}
      {!profile && !myProfileLoading && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-800 dark:text-amber-400 block">Setup profile to activate matching</span>
              <span className="text-amber-600 dark:text-amber-500 block font-medium mt-0.5">
                You must configure your budget limits, lifestyle preferences, and location targets to view compatibility percentages and receive match recommendations.
              </span>
            </div>
          </div>
          <Button variant="primary" size="sm" className="font-bold shrink-0" onClick={() => setIsEditProfileOpen(true)}>
            Complete Profile setup
          </Button>
        </div>
      )}

      {/* Statistics dashboard */}
      {dashboardLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[110px] rounded-2xl bg-secondary-100 dark:bg-secondary-800 animate-pulse border border-secondary-200/50 dark:border-secondary-800/80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatisticsCard
            title="Total Connections"
            value={dashboardData.stats?.totalMatches || 0}
            icon={UserCheck}
            color="bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400"
            trend="Active matches established"
          />
          <StatisticsCard
            title="Incoming Requests"
            value={dashboardData.stats?.pendingReceived || 0}
            icon={Inbox}
            color="bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400"
            trend="Awaiting your approval"
            onClick={() => setActiveTab('received')}
          />
          <StatisticsCard
            title="Outgoing Requests"
            value={dashboardData.stats?.pendingSent || 0}
            icon={Send}
            color="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
            trend="Awaiting replies"
            onClick={() => setActiveTab('sent')}
          />
          <StatisticsCard
            title="Match compatibility"
            value={
              (dashboardData.stats?.totalMatches || 0) > 0
                ? `${dashboardData.stats.matchCompatibility}%`
                : (profile ? `${profile.completionPercentage}%` : '0%')
            }
            icon={Sparkles}
            color="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
            trend={
              (dashboardData.stats?.totalMatches || 0) > 0
                ? 'Average connection compatibility'
                : 'Your profile completeness'
            }
            onClick={() => navigate('/roommates')}
          />
        </div>
      )}

      {/* Tabs navigation block */}
      <div className="border-b border-secondary-200/60 dark:border-secondary-800 shrink-0 flex items-center space-x-6 scrollbar-none overflow-x-auto">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-3.5 text-xs font-bold border-b-2 select-none transition-all ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'border-transparent text-secondary-400 hover:text-secondary-600'
              }`}
            >
              <Icon className="h-4.5 w-4.5 stroke-[1.8]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panel layout */}
      {dashboardLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-secondary-100 dark:bg-secondary-800 animate-pulse border border-secondary-200/50 dark:border-secondary-800/80" />
          ))}
        </div>
      ) : (
        <div className="pt-2">
          {/* TAB: Matches list */}
          {activeTab === 'matches' && (
            dashboardData.acceptedMatches?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.acceptedMatches.map((match) => (
                  <MatchCard
                    key={match._id}
                    match={match}
                    onUnmatch={() => handleUnmatch(match._id, match.companionProfile?.userId?.name)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No roommate matches yet"
                description="Explore other tenant profiles in the Roommate Finder, view compatibility scores, and send match requests to establish connections."
                action={
                  <Button variant="primary" onClick={() => navigate('/roommates')}>
                    Browse Roommate Profiles
                  </Button>
                }
              />
            )
          )}

          {/* TAB: Received requests */}
          {activeTab === 'received' && (
            dashboardData.pendingRequests?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.pendingRequests.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    type="received"
                    onAccept={() => acceptConnectionRequest(req._id)}
                    onReject={() => rejectConnectionRequest(req._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No incoming requests"
                description="When other tenants request to connect with you based on compatibility, their requests will appear here."
              />
            )
          )}

          {/* TAB: Sent requests */}
          {activeTab === 'sent' && (
            dashboardData.sentRequests?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData.sentRequests.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    type="sent"
                    onCancel={() => cancelConnectionRequest(req._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No sent requests"
                description="Find compatible roommates on the discover page and invite them to connect."
                action={
                  <Button variant="primary" onClick={() => navigate('/roommates')}>
                    Find Roommates
                  </Button>
                }
              />
            )
          )}

          {/* TAB: Activity timeline logs */}
          {activeTab === 'activity' && (
            <div className="max-w-2xl bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl p-6 md:p-8 shadow-premium-sm transition-colors">
              <ProfileTimeline activities={dashboardData.recentActivity || []} />
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Wizard Modal */}
      <ProfileEditModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default RoommateDashboard;
