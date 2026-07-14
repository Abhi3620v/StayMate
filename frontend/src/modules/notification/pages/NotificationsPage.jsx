import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import NotificationList from '../components/NotificationList';
import NotificationFilters from '../components/NotificationFilters';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCheck, Archive, ChevronLeft, ChevronRight, BellRing } from 'lucide-react';

export const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    pagination,
    fetchNotifications,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    markAsRead
  } = useNotification();

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchNotifications(newPage);
  };

  const handleResetFilters = () => {
    setFilters({ readStatus: 'all', category: '', priority: '' });
    setSearchQuery('');
  };

  // Skeleton Loader Component
  const NotificationSkeleton = () => (
    <div className="space-y-3.5 animate-pulse">
      {Array(3).fill(0).map((_, idx) => (
        <div key={idx} className="p-5 border border-secondary-100 dark:border-secondary-900 rounded-2xl bg-white dark:bg-secondary-900 flex gap-4">
          <div className="h-11 w-11 rounded-xl bg-secondary-100 dark:bg-secondary-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-secondary-100 dark:bg-secondary-800 rounded" />
            <div className="h-2.5 w-3/4 bg-secondary-150 dark:bg-secondary-850 rounded" />
            <div className="h-2 w-1/4 bg-secondary-100 dark:bg-secondary-800 rounded" />
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
            <BellRing className="h-5 w-5 text-primary-600" />
            Notification Center
          </h2>
          <p className="text-xs text-secondary-450 dark:text-secondary-500 mt-1">
            Manage your alerts, transactional security notices, and platform updates.
          </p>
        </div>

        {/* Bulk Action Buttons */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-2.5">
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              size="xs" 
              className="font-bold flex items-center gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark All Read
            </Button>
          </div>
        )}
      </div>

      {/* Filter and search controllers */}
      <NotificationFilters 
        filters={filters}
        setFilters={setFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={handleResetFilters}
      />

      {/* Primary Notifications Container */}
      {loading ? (
        <NotificationSkeleton />
      ) : (
        <NotificationList 
          items={notifications}
          onMarkRead={(_id) => markAsRead([_id])}
          onArchive={archiveNotification}
          onDelete={deleteNotification}
        />
      )}

      {/* Pagination control footer */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-secondary-150 dark:border-secondary-900/60 pt-5">
          <span className="text-[10px] font-semibold text-secondary-450 dark:text-secondary-500">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} notifications)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
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

export default NotificationsPage;
