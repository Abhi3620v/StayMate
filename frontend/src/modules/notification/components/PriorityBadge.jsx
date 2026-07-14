import React from 'react';

const priorityConfig = {
  critical: 'bg-error-50 text-error-700 dark:bg-error-950/20 dark:text-error-450 border border-error-100 dark:border-error-950',
  high: 'bg-warning-50 text-warning-700 dark:bg-warning-950/20 dark:text-warning-450 border border-warning-100 dark:border-warning-950',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450 border border-blue-100 dark:border-blue-950',
  low: 'bg-secondary-50 text-secondary-650 dark:bg-secondary-900 dark:text-secondary-400 border border-secondary-100 dark:border-secondary-900',
};

export const PriorityBadge = ({ priority = 'medium', className = '' }) => {
  const styles = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize tracking-wide select-none ${styles} ${className}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
