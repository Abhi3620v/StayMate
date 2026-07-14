import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable animated Spinner indicator
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const colors = {
    primary: 'border-primary-500/20 border-t-primary-600',
    white: 'border-white/20 border-t-white',
    gray: 'border-secondary-200 border-t-secondary-600 dark:border-secondary-800 dark:border-t-secondary-400',
    current: 'border-current/20 border-t-current',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid',
        sizes[size],
        colors[color],
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
