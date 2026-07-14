import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Placeholder component when databases or arrays return empty sets
 */
const EmptyState = ({
  className,
  title = 'No records found',
  description = 'Try adjusting your filters or search terms to find what you are looking for.',
  icon,
  action,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-secondary-300 dark:border-secondary-750 rounded-[14px] bg-secondary-50/50 dark:bg-secondary-900/20 max-w-md mx-auto my-6',
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="text-secondary-400 dark:text-secondary-600 mb-4">{icon}</div>
      ) : (
        <div className="h-12 w-12 rounded-[14px] bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-500 dark:text-secondary-400 mb-4">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default EmptyState;
