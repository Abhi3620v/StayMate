import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable Badge / Tag label component
 */
const Badge = ({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

  const variants = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200 border border-secondary-200 dark:border-secondary-700/50',
    success: 'bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border border-success-200 dark:border-success-800/30',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950/20 dark:text-warning-400 border border-warning-200 dark:border-warning-800/30',
    error: 'bg-error-50 text-error-700 dark:bg-error-950/20 dark:text-error-400 border border-error-200 dark:border-error-800/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
