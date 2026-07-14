import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Animated Pulsing placeholder for Cumulative Layout Shift prevention.
 */
const Skeleton = ({
  className,
  variant = 'text', // 'text', 'rect', 'circle'
  ...props
}) => {
  const variants = {
    text: 'h-4 w-full rounded',
    rect: 'h-32 w-full rounded-xl',
    circle: 'h-10 w-10 rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-secondary-200 dark:bg-secondary-800 shrink-0',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
