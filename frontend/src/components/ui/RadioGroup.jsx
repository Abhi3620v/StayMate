import React from 'react';
import { cn } from '@/utils/cn';
import Label from './Label';
import ErrorMessage from './ErrorMessage';

/**
 * Group of custom radio selection components
 */
const RadioGroup = React.forwardRef(({
  className,
  label,
  error,
  name,
  options = [],
  defaultValue,
  inline = false,
  required = false,
  ...props
}, ref) => {
  const errorId = `radio-group-${name}-error`;

  return (
    <div className="w-full">
      {label && <Label required={required}>{label}</Label>}
      <div
        className={cn(
          'flex',
          inline ? 'flex-row space-x-6' : 'flex-col space-y-2',
          className
        )}
      >
        {options.map((opt) => {
          const optionId = `radio-${name}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center">
              <input
                ref={ref}
                type="radio"
                id={optionId}
                name={name}
                value={opt.value}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={cn(
                  'h-4 w-4 border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/40 text-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer shadow-premium-sm',
                  error && 'border-error-500 focus:ring-error-500/20'
                )}
                {...props}
              />
              <label
                htmlFor={optionId}
                className="ml-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 cursor-pointer select-none"
              >
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
      <ErrorMessage id={errorId}>{error}</ErrorMessage>
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
