import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import Label from './Label';
import ErrorMessage from './ErrorMessage';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Text/Password/Email input component.
 * Integrates error status, helper texts, and custom styles overrides.
 */
const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  id,
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
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
            'w-full px-4 py-2.5 border rounded-[14px] bg-secondary-50/50 dark:bg-secondary-900/40 border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-secondary-100 transition-all focus:bg-white dark:focus:bg-secondary-900 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm placeholder-secondary-400 dark:placeholder-secondary-500 disabled:opacity-50 disabled:bg-secondary-100 dark:disabled:bg-secondary-950 shadow-premium-sm',
            isPassword && 'pr-11',
            error && 'border-error-500 focus:ring-error-500/20 focus:border-error-500 dark:border-error-500',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-750 dark:hover:text-secondary-200 transition-colors flex items-center justify-center h-7 w-7 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
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

Input.displayName = 'Input';

export default Input;
