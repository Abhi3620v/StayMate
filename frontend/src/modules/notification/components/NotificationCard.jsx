import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, KeyRound, CheckCircle, ShieldAlert, UserPlus, UserCheck, UserX, 
  Home, AlertTriangle, Calendar, CalendarCheck, CalendarX, Clock, Star, 
  MessageSquare, ThumbsUp, Archive, Trash2, Check, ArrowRight
} from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const iconMap = {
  key: KeyRound,
  'check-circle': CheckCircle,
  'shield-alert': ShieldAlert,
  'user-plus': UserPlus,
  'user-check': UserCheck,
  'user-x': UserX,
  home: Home,
  'triangle-alert': AlertTriangle,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  'calendar-x': CalendarX,
  clock: Clock,
  star: Star,
  'message-square': MessageSquare,
  'thumbs-up': ThumbsUp,
  bell: Bell,
};

export const NotificationCard = ({ 
  notification, 
  onMarkRead, 
  onArchive, 
  onDelete 
}) => {
  const navigate = useNavigate();
  const {
    _id,
    title,
    message,
    description,
    category,
    priority,
    icon,
    actionUrl,
    readStatus,
    createdAt
  } = notification;

  const IconComponent = iconMap[icon] || Bell;

  const handleCardClick = () => {
    // Mark as read
    if (!readStatus && onMarkRead) {
      onMarkRead(_id);
    }
    
    let targetUrl = actionUrl;
    if (!targetUrl || targetUrl.startsWith('/profile')) {
      targetUrl = '/notifications';
    }

    // Navigate
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'auth': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'property': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20';
      case 'roommate': return 'text-violet-500 bg-violet-50 dark:bg-violet-950/20';
      case 'visit': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'chat': return 'text-sky-500 bg-sky-50 dark:bg-sky-950/20';
      case 'review': return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20';
      case 'admin': return 'text-rose-500 bg-rose-50 dark:bg-rose-950/20';
      default: return 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900';
    }
  };

  const formattedTime = new Date(createdAt).toLocaleString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className={`group relative p-5 border rounded-2xl transition-all duration-300 shadow-premium-sm hover:shadow-premium flex gap-4 ${
      readStatus 
        ? 'bg-white dark:bg-secondary-900 border-secondary-100 dark:border-secondary-900' 
        : 'bg-primary-50/15 dark:bg-primary-950/5 border-primary-100/50 dark:border-primary-900/20'
    }`}>
      {/* Read Status Dot Indicator */}
      {!readStatus && (
        <span className="absolute top-5 left-3.5 h-2.5 w-2.5 bg-primary-600 rounded-full" />
      )}

      {/* Left Icon Panel */}
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${getCategoryColor()}`}>
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 
            onClick={handleCardClick}
            className={`text-xs font-bold truncate leading-tight cursor-pointer hover:text-primary-600 transition-colors ${
              readStatus ? 'text-secondary-800 dark:text-secondary-200' : 'text-secondary-950 dark:text-white'
            }`}
          >
            {title}
          </h4>
          <PriorityBadge priority={priority} />
        </div>

        <p className="text-[11px] font-medium text-secondary-600 dark:text-secondary-400 leading-normal">
          {message}
        </p>

        {description && (
          <p className="text-[10px] text-secondary-450 dark:text-secondary-500 leading-normal bg-secondary-50/50 dark:bg-secondary-950/40 p-2.5 rounded-xl border border-secondary-100/30 dark:border-secondary-900/40">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] font-semibold text-secondary-400">
            {formattedTime}
          </span>
          {actionUrl && (
            <button 
              onClick={handleCardClick}
              className="text-[9px] font-bold text-primary-650 hover:text-primary-500 uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              Action <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons Panel */}
      <div className="flex items-start gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {!readStatus && onMarkRead && (
          <button
            onClick={() => onMarkRead(_id)}
            title="Mark as read"
            className="p-1.5 rounded-lg border border-secondary-200/40 hover:bg-success-50 hover:text-success-600 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        {onArchive && (
          <button
            onClick={() => onArchive(_id)}
            title="Archive"
            className="p-1.5 rounded-lg border border-secondary-200/40 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(_id)}
            title="Delete"
            className="p-1.5 rounded-lg border border-secondary-200/40 hover:bg-error-50 hover:text-error-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
