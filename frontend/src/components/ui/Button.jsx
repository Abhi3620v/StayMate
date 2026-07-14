import React from 'react';
import { cn } from '@/utils/cn';
import Spinner from './Spinner';

/**
 * Reusable Accessible Button Component with 14px border radius.
 */
const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[14px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.97] ease-out';

  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-secondary-900 hover:shadow-premium-md hover:-translate-y-0.5 focus:ring-primary-500 shadow-premium-sm border border-primary-600/10',
    secondary: 'border border-secondary-200 dark:border-secondary-800 bg-white hover:bg-secondary-100 dark:bg-secondary-900 dark:hover:bg-secondary-800 text-secondary-800 dark:text-secondary-100 hover:shadow-premium-sm focus:ring-primary-500',
    outline: 'border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-100 dark:border-secondary-750 dark:text-secondary-300 dark:hover:bg-secondary-900 focus:ring-primary-500',
    ghost: 'bg-transparent text-secondary-650 hover:bg-secondary-100/70 hover:text-secondary-900 dark:text-secondary-350 dark:hover:bg-secondary-900/60 dark:hover:text-secondary-100 focus:ring-primary-500',
    danger: 'bg-gradient-to-b from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white hover:shadow-premium-md hover:-translate-y-0.5 focus:ring-error-500 shadow-premium-sm border border-error-600/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6.5 py-3 text-base gap-2.5',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="text-current shrink-0 mr-1.5" />}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
