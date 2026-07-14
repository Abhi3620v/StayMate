import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Forms validation Error Message feedback component
 */
const ErrorMessage = ({
  children,
  className,
  id,
  ...props
}) => {
  if (!children) return null;

  return (
    <p
      id={id}
      className={cn(
        'text-xs text-error-600 dark:text-error-500 mt-1 select-none font-medium',
        className
      )}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
};

export default ErrorMessage;
