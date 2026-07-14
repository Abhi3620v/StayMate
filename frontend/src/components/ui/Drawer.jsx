import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';

/**
 * Slide-in drawer container component.
 */
const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  placement = 'right', // 'left', 'right', 'bottom'
  size = 'md',
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
    xl: 'max-w-lg',
  };

  const placementClasses = {
    left: 'left-0 top-0 h-full animate-slide-right border-r',
    right: 'right-0 top-0 h-full animate-slide-left border-l',
    bottom: 'bottom-0 left-0 w-full h-[50vh] animate-slide-up border-t',
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-secondary-950/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          'absolute bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800 shadow-2xl flex flex-col',
          placementClasses[placement],
          placement !== 'bottom' && sizes[size],
          placement !== 'bottom' && 'w-full',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100 dark:border-secondary-800 shrink-0">
          <h3 className="text-base font-semibold text-secondary-900 dark:text-secondary-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 focus:outline-none"
            aria-label="Close drawer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto text-sm text-secondary-700 dark:text-secondary-300">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
