import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import ActivityTimeline from '../components/ActivityTimeline';
import Button from '@/components/ui/Button';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

export const ActivityPage = () => {
  const {
    activities,
    activitiesLoading,
    activityPagination,
    fetchActivityFeed
  } = useNotification();

  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchActivityFeed(1, categoryFilter);
  }, [categoryFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > activityPagination.totalPages) return;
    fetchActivityFeed(newPage, categoryFilter);
  };

  const categories = [
    { label: 'All Activities', value: '' },
    { label: 'Security & Auth', value: 'auth' },
    { label: 'Stays & Property', value: 'property' },
    { label: 'Roommate Matches', value: 'roommate' },
    { label: 'Visits & Tours', value: 'visit' },
    { label: 'Chat Messaging', value: 'chat' },
    { label: 'Reviews & Feedback', value: 'review' },
  ];

  // Activity Timeline Skeleton Loader
  const TimelineSkeleton = () => (
    <div className="pl-6 border-l border-secondary-100 dark:border-secondary-900 space-y-8 animate-pulse max-w-2xl mx-auto">
      {Array(3).fill(0).map((_, idx) => (
        <div key={idx} className="relative flex flex-col gap-3">
          <div className="absolute -left-[35px] h-6 w-6 rounded-full bg-secondary-100 dark:bg-secondary-800" />
          <div className="w-full p-4 border border-secondary-100 dark:border-secondary-900 bg-white dark:bg-secondary-900 rounded-2xl space-y-2">
            <div className="h-3 w-1/4 bg-secondary-100 dark:bg-secondary-800 rounded" />
            <div className="h-3.5 w-1/2 bg-secondary-150 dark:bg-secondary-850 rounded" />
            <div className="h-2.5 w-5/6 bg-secondary-100 dark:bg-secondary-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary-200/60 dark:border-secondary-900/60 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-secondary-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-primary-650" />
            Activity Timeline
          </h2>
          <p className="text-xs text-secondary-450 dark:text-secondary-500 mt-1">
            Browse chronological events and interactions recorded across the StayMate workspace.
          </p>
        </div>

        {/* Category Pills Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold px-4 py-2 rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-900 text-secondary-850 dark:text-secondary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer appearance-none pr-8 relative"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Timeline Render */}
      {activitiesLoading ? (
        <TimelineSkeleton />
      ) : (
        <ActivityTimeline items={activities} />
      )}

      {/* Timeline Pagination controls */}
      {!activitiesLoading && activityPagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-secondary-150 dark:border-secondary-900/60 pt-5">
          <span className="text-[10px] font-semibold text-secondary-450 dark:text-secondary-500">
            Showing Page {activityPagination.page} of {activityPagination.totalPages} ({activityPagination.total} activity logs)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePageChange(activityPagination.page - 1)}
              disabled={activityPagination.page === 1}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePageChange(activityPagination.page + 1)}
              disabled={activityPagination.page === activityPagination.totalPages}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
