import React, { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Bubble information tooltip overlay component
 */
const Tooltip = ({
  children,
  content,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          className={cn(
            'absolute z-45 px-2.5 py-1.5 text-xs font-medium rounded bg-secondary-900 text-white dark:bg-secondary-800 border border-secondary-800 dark:border-secondary-750 shadow-md whitespace-nowrap pointer-events-none select-none animate-fade-in',
            positions[position],
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
