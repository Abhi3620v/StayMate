import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ArrowRight, BellOff } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotification();

  // Show top 5 recent notifications
  const recentAlerts = notifications.slice(0, 5);

  const handleItemClick = (n) => {
    if (!n.readStatus) {
      markAsRead([n._id]);
    }
    
    let targetUrl = n.actionUrl;
    if (!targetUrl || targetUrl.startsWith('/profile')) {
      targetUrl = '/notifications';
    }

    if (targetUrl) {
      navigate(targetUrl);
    }
    onClose();
  };

  const handleMarkItemRead = (e, id) => {
    e.stopPropagation();
    markAsRead([id]);
  };

  const getRelativeTime = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 mt-2.5 w-auto sm:w-80 bg-white dark:bg-secondary-950 border border-secondary-200/60 dark:border-secondary-900/60 rounded-2xl shadow-xl p-4 space-y-3.5 z-40 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center text-[11px] font-bold text-secondary-900 dark:text-white border-b pb-2 border-secondary-100 dark:border-secondary-900/60">
        <span className="flex items-center gap-1.5">
          🔔 Notifications {unreadCount > 0 && <span className="px-1.5 py-0.5 rounded bg-error-500 text-white font-extrabold text-[8px]">{unreadCount}</span>}
        </span>
        <div className="flex items-center space-x-2.5">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-[9px] text-primary-650 hover:text-primary-500 transition-colors uppercase tracking-wider font-bold"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List items */}
      {recentAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-2 text-center space-y-2">
          <BellOff className="h-5 w-5 text-secondary-300 dark:text-secondary-700" />
          <p className="text-[10px] text-secondary-400 italic">
            No unread alerts
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {recentAlerts.map((n) => (
            <div
              key={n._id}
              onClick={() => handleItemClick(n)}
              className={`group flex items-start gap-2.5 p-2.5 rounded-xl border border-transparent hover:bg-secondary-50 dark:hover:bg-secondary-900/40 cursor-pointer transition-all relative ${
                !n.readStatus ? 'bg-primary-50/10 dark:bg-primary-950/5' : ''
              }`}
            >
              {/* Unread status dot */}
              {!n.readStatus && (
                <span className="absolute top-4 left-1.5 h-1.5 w-1.5 bg-primary-600 rounded-full" />
              )}
              
              <div className="flex-1 min-w-0 pl-1.5 space-y-0.5">
                <p className={`text-[10px] font-bold leading-snug truncate ${
                  n.readStatus ? 'text-secondary-700 dark:text-secondary-400' : 'text-secondary-900 dark:text-white'
                }`}>
                  {n.title}
                </p>
                <p className="text-[9px] font-medium text-secondary-500 dark:text-secondary-450 leading-snug line-clamp-2">
                  {n.message}
                </p>
                <span className="text-[8px] text-secondary-400 font-semibold block pt-0.5">
                  {getRelativeTime(n.createdAt)}
                </span>
              </div>

              {/* Dismiss read check */}
              {!n.readStatus && (
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-success-50 hover:text-success-600 transition-all shrink-0 self-center"
                  onClick={(e) => handleMarkItemRead(e, n._id)}
                  title="Mark as read"
                >
                  <Check className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-secondary-100 dark:border-secondary-900/60 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="text-[9px] font-bold text-primary-650 hover:text-primary-500 uppercase tracking-widest flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          View All Alerts <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
