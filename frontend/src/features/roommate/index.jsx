import React, { useEffect, useState } from 'react';
import { useRoommate } from '@/context/RoommateContext';
import { useAuth } from '@/context/AuthContext';
import RoommateCard from './components/RoommateCard';
import { UnifiedSearch } from '@/components/dashboard/index';
import CompatibilityBadge from './components/CompatibilityBadge';
import FiltersPanel from './components/FiltersPanel';
import ProfileCompletionCard from './components/ProfileCompletionCard';
import ProfileEditModal from './components/ProfileEditModal';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Card from '@/components/ui/Card';
import { Search, Sparkles, Filter, Users, UserPlus, ListCollapse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Roommates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    profile,
    myProfileLoading,
    discoveryMatches,
    discoveryLoading,
    pagination,
    fetchDiscoveryMatches,
    filters,
    searchQuery,
    setSearchQuery,
    updateFilters,
    resetFilters,
  } = useRoommate();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Initial load and reload on filter change
  useEffect(() => {
    fetchDiscoveryMatches(1);
  }, [filters, searchQuery]);

  const handlePageChange = (page) => {
    fetchDiscoveryMatches(page);
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Title Header Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-secondary-200/60 dark:border-secondary-900/60">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white flex items-center tracking-tight">
            <Sparkles className="h-6 w-6 text-primary-500 mr-2 shrink-0 stroke-[1.8]" />
            Roommate Discovery
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 font-semibold mt-1">
            Connect with compatible students and professionals based on rent budget and lifestyle alignment.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center space-x-3 w-full md:w-auto mt-3 md:mt-0 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold flex items-center justify-center space-x-1.5 py-2.5 w-[160px] border-secondary-200 dark:border-secondary-800"
            onClick={() => navigate('/roommates/dashboard')}
          >
            <Users className="h-4 w-4" />
            <span>Matches Console</span>
          </Button>

          {profile ? (
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold flex items-center justify-center py-2.5 w-[160px]"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <span>Edit Profile</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold flex items-center justify-center space-x-1.5 py-2.5 w-[160px]"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Match</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Inline filters on desktop, Profile Completeness */}
        <div className="space-y-6 lg:col-span-1 hidden lg:block bg-white dark:bg-secondary-900/50 p-6 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[20px] shadow-premium-sm">
          {profile && (
            <ProfileCompletionCard
              percentage={profile.completionPercentage}
              missingInformation={profile.missingInformation || []}
              onEditClick={() => setIsEditProfileOpen(true)}
            />
          )}

          <FiltersPanel
            filters={filters}
            searchQuery={searchQuery}
            onFilterChange={handleFilterChange}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onReset={resetFilters}
          />
        </div>

        {/* Right Side: Search bar, Mobile filters button, Profiles grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Search/Filter bar for Mobile & Search box */}
          <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800/80 rounded-[20px] shadow-premium-sm transition-colors">
            <div className="flex-grow">
              <UnifiedSearch
                placeholder="Search roommate preferred cities, areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-none"
              />
            </div>

            {/* Mobile Filters trigger button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden text-xs font-bold py-2.5 px-3 border-secondary-200 dark:border-secondary-800 h-[36px]"
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <Filter className="h-4 w-4 mr-1 shrink-0" />
              Filters
            </Button>
          </div>

          {/* Profile Completion Card for Mobile */}
          {profile && (
            <div className="lg:hidden">
              <ProfileCompletionCard
                percentage={profile.completionPercentage}
                missingInformation={profile.missingInformation || []}
                onEditClick={() => setIsEditProfileOpen(true)}
              />
            </div>
          )}

          {/* Grid list container */}
          {discoveryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-5 flex flex-col justify-between h-full bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[20px] shadow-premium-sm">
                  <div className="space-y-4 flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-2xl bg-secondary-200 dark:bg-secondary-800 animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3.5 w-24 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                          <div className="h-2 w-32 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 w-16 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-full bg-secondary-100 dark:bg-secondary-950 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-4 w-12 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                      <div className="h-4 w-14 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between mt-4">
                    <div className="space-y-1">
                      <div className="h-2 w-16 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-secondary-200 dark:bg-secondary-800 rounded animate-pulse" />
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-14 bg-secondary-200 dark:bg-secondary-800 rounded-xl animate-pulse" />
                      <div className="h-8 w-14 bg-secondary-250 dark:bg-secondary-750 rounded-xl animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : discoveryMatches.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {discoveryMatches.map((rm) => {
                  const rmProfile = {
                    id: rm._id,
                    user: {
                      name: rm.userId?.name || 'Roommate User',
                      avatar: rm.profilePicture || rm.userId?.avatar || '',
                    },
                    age: rm.basicInfo?.age || 20,
                    gender: rm.basicInfo?.gender || 'male',
                    occupation: rm.basicInfo?.occupation || 'student',
                    budget: rm.budget?.monthlyRent || 0,
                    foodPreference: rm.lifestyle?.foodPreference || 'any',
                    smoking: !!rm.lifestyle?.smoking,
                    drinking: !!rm.lifestyle?.drinking,
                    compatibilityScore: rm.compatibilityScore || 0,
                    languages: rm.languagesSpoken || [],
                    sleepSchedule: rm.lifestyle?.sleepingSchedule || 'flexible',
                    bio: rm.basicInfo?.bio || '',
                    isVerified: !!rm.isVerified,
                    completionPercentage: rm.completionPercentage || 98,
                  };
                  return <RoommateCard key={rm._id} profile={rmProfile} />;
                })}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="pt-4 flex justify-center">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card className="py-16 text-center space-y-4 max-w-md mx-auto border border-secondary-200 dark:border-secondary-800 rounded-[20px] bg-white dark:bg-secondary-900 shadow-premium-sm">
              <div className="p-4 bg-secondary-100 dark:bg-secondary-950 rounded-full w-fit mx-auto text-secondary-500">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1 px-4">
                <h3 className="text-base font-black text-secondary-900 dark:text-white">
                  No compatible roommates found
                </h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-450 leading-relaxed max-w-sm mx-auto">
                  We couldn't find roommates matching your exact preferences. Try widening your budget, expanding preferred areas, or resetting filters.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters} className="font-bold text-xs rounded-full px-5 py-2">
                  Reset Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Drawer filter panel for Mobile devices */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Search Filters"
        size="sm"
      >
        <FiltersPanel
          filters={filters}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onReset={() => {
            resetFilters();
            setIsFilterDrawerOpen(false);
          }}
          onApply={() => setIsFilterDrawerOpen(false)}
        />
      </Drawer>

      {/* Edit Profile Wizard Modal */}
      <ProfileEditModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default Roommates;
