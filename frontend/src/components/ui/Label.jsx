import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Accessible Input Label element
 */
const Label = ({
  children,
  className,
  htmlFor,
  required = false,
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-[10px] font-bold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1.5 select-none',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
};

export default Label;
