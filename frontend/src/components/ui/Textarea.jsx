import React from 'react';
import { cn } from '@/utils/cn';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

/**
 * Multi-line text area component
 */
const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  id,
  required = false,
  rows = 4,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={
          cn(
            error ? errorId : undefined,
            helperText ? helperId : undefined
          ) || undefined
        }
        className={cn(
          'w-full px-4 py-2.5 border rounded-[14px] bg-secondary-50/50 dark:bg-secondary-900/40 border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-secondary-100 transition-all focus:bg-white dark:focus:bg-secondary-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm placeholder-secondary-400 dark:placeholder-secondary-500 disabled:opacity-50 disabled:bg-secondary-100 dark:disabled:bg-secondary-950 shadow-premium-sm resize-y',
          error && 'border-error-500 focus:ring-error-500/20 focus:border-error-500 dark:border-error-500',
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p id={helperId} className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
          {helperText}
        </p>
      )}
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
