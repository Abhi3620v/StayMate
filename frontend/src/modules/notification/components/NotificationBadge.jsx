import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBadge = ({ count = 0, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors relative focus:outline-none ${className}`}
      aria-label={`${count} unread notifications`}
    >
      <Bell className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-h-[16px] min-w-[16px] px-1 rounded-full bg-error-500 text-white text-[8px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-secondary-900 animate-pulse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
