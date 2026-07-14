import React from 'react';
import { cn } from '@/utils/cn';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

/**
 * Dropdown select input component
 */
const Select = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  id,
  required = false,
  options = [],
  placeholder = 'Select an option',
  children,
  ...props
}, ref) => {
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            cn(
              error ? errorId : undefined,
              helperText ? helperId : undefined
            ) || undefined
          }
          className={cn(
            'w-full px-4 py-2.5 border rounded-[14px] bg-secondary-50/50 dark:bg-secondary-900/40 border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-secondary-100 transition-all focus:bg-white dark:focus:bg-secondary-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm disabled:opacity-50 disabled:bg-secondary-100 dark:disabled:bg-secondary-950 appearance-none pr-10 shadow-premium-sm',
            error && 'border-error-500 focus:ring-error-500/20 focus:border-error-500 dark:border-error-500',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-secondary-400 dark:text-secondary-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {helperText && !error && (
        <p id={helperId} className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">
          {helperText}
        </p>
      )}
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
