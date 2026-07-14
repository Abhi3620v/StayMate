import React from 'react';
import { cn } from '@/utils/cn';
import ErrorMessage from './ErrorMessage';

/**
 * Reusable accessible Checkbox component
 */
const Checkbox = React.forwardRef(({
  className,
  label,
  error,
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${checkboxId}-error`;

  return (
    <div className="flex flex-col">
      <div className="flex items-start">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-4 w-4 rounded-[6px] border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/40 text-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer mt-0.5 shadow-premium-sm',
            error && 'border-error-500 focus:ring-error-500/20',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
