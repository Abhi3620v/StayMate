import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Notification Lists
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [preferences, setPreferences] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [filters, setFilters] = useState({ readStatus: 'all', category: '', priority: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [activityPagination, setActivityPagination] = useState({ page: 1, limit: 20, totalPages: 1, total: 0 });
  
  // Undo helper
  const [lastArchivedId, setLastArchivedId] = useState(null);

  const socketRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to retrieve unread notification count:', err.message);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getPreferences();
      setPreferences(res.data || null);
    } catch (err) {
      console.warn('Failed to retrieve notification settings:', err.message);
    }
  };

  // Update preferences
  const updatePreferences = async (newPrefs) => {
    try {
      const res = await notificationService.updatePreferences(newPrefs);
      setPreferences(res.data);
      toast.success('Notification settings saved.');
      return res.data;
    } catch (err) {
      toast.error('Failed to update notification settings.');
      throw err;
    }
  };

  // Fetch notifications list
  const fetchNotifications = async (page = 1) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.limit,
        readStatus: filters.readStatus,
        category: filters.category,
        priority: filters.priority,
        search: searchQuery
      };

      const res = await notificationService.getNotifications(params);
      setNotifications(res.data || []);
      setPagination({
        page: res.pagination?.page || 1,
        limit: res.pagination?.limit || 15,
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve notifications.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity feed
  const fetchActivityFeed = async (page = 1, category = '') => {
    if (!user) return;
    setActivitiesLoading(true);
    try {
      const params = {
        page,
        limit: activityPagination.limit,
        category
      };
      const res = await notificationService.getActivityFeed(params);
      setActivities(res.data || []);
      setActivityPagination({
        page: res.pagination?.page || 1,
        limit: res.pagination?.limit || 20,
        totalPages: res.pagination?.totalPages || 1,
        total: res.pagination?.total || 0
      });
    } catch (err) {
      console.warn('Failed to load activity logs:', err.message);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Mark specific array as read
  const markAsRead = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    try {
      await notificationService.markRead(ids);
      setNotifications(prev => 
        prev.map(n => ids.includes(n._id) ? { ...n, readStatus: true } : n)
      );
      fetchUnreadCount();
    } catch (err) {
      console.warn('Failed to mark read:', err.message);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  // Archive notification
  const archiveNotification = async (id) => {
    try {
      await notificationService.archive(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setLastArchivedId(id);
      fetchUnreadCount();
      toast.success('Notification archived.', {
        action: {
          label: 'Undo',
          onClick: () => undoArchive(id)
        }
      });
    } catch (err) {
      toast.error('Failed to archive notification.');
    }
  };

  // Undo Archive
  const undoArchive = async (id) => {
    const targetId = id || lastArchivedId;
    if (!targetId) return;
    try {
      await notificationService.undoArchive(targetId);
      setLastArchivedId(null);
      fetchNotifications(pagination.page);
      fetchUnreadCount();
      toast.success('Notification restored.');
    } catch (err) {
      toast.error('Failed to restore notification.');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      fetchUnreadCount();
      toast.success('Notification deleted.');
    } catch (err) {
      toast.error('Failed to delete notification.');
    }
  };

  // Connect socket client
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setActivities([]);
      setPreferences(null);
      return;
    }

    // 1. Initial REST loads
    fetchUnreadCount();
    fetchPreferences();
    fetchNotifications(1);

    // 2. Establish Socket connection
    const token = localStorage.getItem('accessToken');
    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { userId: user.id || user._id },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Live notifications channel connected.');
    });

    // Handle incoming notification
    socket.on('notification_received', (newNotif) => {
      setNotifications(prev => {
        // Grouping: Check if this was an update to an existing notification in state
        const existsIdx = prev.findIndex(n => String(n._id) === String(newNotif._id));
        if (existsIdx !== -1) {
          const copy = [...prev];
          copy[existsIdx] = newNotif;
          return copy;
        }
        return [newNotif, ...prev];
      });

      // Increment count
      setUnreadCount(c => c + 1);

      // Trigger hot toast banner alert
      toast(
        (t) => (
          <div className="flex flex-col space-y-0.5 text-left">
            <span className="font-bold text-xs text-secondary-900 leading-tight">🔔 {newNotif.title}</span>
            <span className="text-[11px] text-secondary-650 leading-normal">{newNotif.message}</span>
          </div>
        ),
        {
          duration: 4000,
          position: 'top-right',
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            padding: '12px 16px',
            border: '1px solid #e2e8f0',
          }
        }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch when filters update
  useEffect(() => {
    if (user) {
      fetchNotifications(1);
    }
  }, [filters, searchQuery]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activities,
        preferences,
        loading,
        activitiesLoading,
        error,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        pagination,
        activityPagination,
        fetchNotifications,
        fetchActivityFeed,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        undoArchive,
        deleteNotification,
        updatePreferences,
        fetchUnreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

export default NotificationContext;
