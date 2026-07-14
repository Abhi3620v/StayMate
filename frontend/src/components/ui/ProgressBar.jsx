import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable process progress indicator bar
 */
const ProgressBar = ({
  className,
  value = 0, // 0 to 100
  color = 'primary', // 'primary', 'success', 'warning', 'error'
  showLabel = false,
  barClassName,
  ...props
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
            Progress
          </span>
        )}
        {showLabel && (
          <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
            {Math.round(normalizedValue)}%
          </span>
        )}
      </div>
      <div className="w-full bg-secondary-200 dark:bg-secondary-800 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-normal ease-out rounded-full', colors[color], barClassName)}
          style={{ width: `${normalizedValue}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
