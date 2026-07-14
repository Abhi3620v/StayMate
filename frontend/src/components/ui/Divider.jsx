import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Visual separation divider component
 */
const Divider = ({
  className,
  orientation = 'horizontal',
  children,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center my-4',
        isHorizontal ? 'w-full flex-row' : 'h-full flex-col self-stretch',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'bg-secondary-200 dark:bg-secondary-800',
          isHorizontal ? 'h-[1px] w-full' : 'w-[1px] h-full'
        )}
      />
      {children && isHorizontal && (
        <span className="absolute bg-white dark:bg-secondary-900 px-3 text-xs text-secondary-500 dark:text-secondary-400 select-none">
          {children}
        </span>
      )}
    </div>
  );
};

export default Divider;
  
