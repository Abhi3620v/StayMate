import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable layout container with standard styling cards
 */
const Card = React.forwardRef(({
  className,
  children,
  hoverable = false,
  onClick,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'rounded-[20px] border border-secondary-200/60 dark:border-secondary-800/80 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 shadow-premium-sm overflow-hidden transition-all duration-normal ease-out',
        hoverable && 'hover:shadow-premium-md hover:border-secondary-300 dark:hover:border-secondary-700 hover:-translate-y-0.5',
        onClick && 'cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
