import React from 'react';
import NotificationCard from './NotificationCard';
import { useNotification } from '../context/NotificationContext';
import { BellOff } from 'lucide-react';

const getGroupLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - 7);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else if (date >= startOfWeek) {
    return 'This Week';
  } else {
    return 'Older';
  }
};

export const NotificationList = ({ 
  items, 
  onMarkRead, 
  onArchive, 
  onDelete 
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 px-4 text-center space-y-3 bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-900 rounded-3xl">
        <div className="h-14 w-14 rounded-2xl bg-secondary-50 dark:bg-secondary-800 flex items-center justify-center text-secondary-400">
          <BellOff className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-secondary-900 dark:text-white">All caught up!</h5>
          <p className="text-[10px] text-secondary-450 dark:text-secondary-500 max-w-xs">
            There are no notifications matching your filters. New alerts will show up in real-time.
          </p>
        </div>
      </div>
    );
  }

  // Group items by bucket labels
  const groups = {};
  items.forEach(item => {
    const label = getGroupLabel(item.createdAt);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  });

  const orderedLabels = ['Today', 'Yesterday', 'This Week', 'Older'].filter(l => groups[l] && groups[l].length > 0);

  return (
    <div className="space-y-6">
      {orderedLabels.map(label => (
        <div key={label} className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{label}</span>
            <div className="flex-1 h-px bg-secondary-100 dark:bg-secondary-900/60" />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {groups[label].map(n => (
              <NotificationCard 
                key={n._id}
                notification={n}
                onMarkRead={onMarkRead}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
