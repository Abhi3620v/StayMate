import React from 'react';
import { cn } from '@/utils/cn';
import { MessageSquare, Calendar, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable notification item component
 */
const NotificationItem = ({
  notification = {
    id: 'mock-notif-1',
    title: 'New Message Received',
    message: 'Rahul sent you a message: Is the room still available?',
    type: 'message', // 'message', 'visit_request', 'match', 'system'
    priority: 'medium',
    isRead: false,
    actionUrl: '/chat',
    createdAt: '2026-07-03T10:00:00.000Z',
  },
  onMarkAsRead,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-primary-600 dark:text-primary-400" />;
      case 'visit_request':
        return <Calendar className="h-4 w-4 text-success-600 dark:text-success-400" />;
      case 'match':
        return <Sparkles className="h-4 w-4 text-warning-600 dark:text-warning-400" />;
      case 'system':
      default:
        return <Shield className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />;
    }
  };

  const formattedDate = new Date(notification.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      to={notification.actionUrl || '#'}
      onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
      className={cn(
        'flex items-start p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 border-b border-secondary-100 dark:border-secondary-800/80 transition-colors',
        !notification.isRead && 'bg-primary-50/20 dark:bg-primary-950/5'
      )}
    >
      {/* Icon Frame */}
      <div className="h-8 w-8 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center shrink-0 mr-3 mt-0.5">
        {getIcon()}
      </div>

      {/* Description Details */}
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center justify-between mb-0.5">
          <p className={cn(
            'text-xs truncate text-secondary-900 dark:text-white',
            !notification.isRead ? 'font-bold' : 'font-semibold'
          )}>
            {notification.title}
          </p>
          <span className="text-[10px] text-secondary-400 shrink-0 ml-2">{formattedDate}</span>
        </div>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Unread circle badge */}
      <div className="shrink-0 flex items-center self-center pl-2">
        {!notification.isRead ? (
          <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
        ) : (
          <ChevronRight className="h-4 w-4 text-secondary-300" />
        )}
      </div>
    </Link>
  );
};

export default NotificationItem;
