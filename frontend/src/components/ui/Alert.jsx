import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable inline notification alert box
 */
const Alert = ({
  className,
  children,
  variant = 'info', // 'info', 'success', 'warning', 'error'
  title,
  onClose,
  ...props
}) => {
  const variants = {
    info: 'bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900/50',
    success: 'bg-success-50 text-success-800 border-success-200 dark:bg-success-950/10 dark:text-success-400 dark:border-success-900/30',
    warning: 'bg-warning-50 text-warning-800 border-warning-200 dark:bg-warning-950/10 dark:text-warning-400 dark:border-warning-900/30',
    error: 'bg-error-50 text-error-800 border-error-200 dark:bg-error-950/10 dark:text-error-400 dark:border-error-900/30',
  };

  const icons = {
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        'flex items-start p-4 border rounded-xl mb-4',
        variants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <div className="shrink-0 mr-3 mt-0.5">{icons[variant]}</div>
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm mb-1 leading-none">{title}</h5>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-3 shrink-0 text-current hover:opacity-75 focus:outline-none"
          aria-label="Close alert"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
