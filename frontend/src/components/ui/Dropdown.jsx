import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable dropdown menu list trigger component.
 */
const Dropdown = ({
  trigger,
  children,
  align = 'right', // 'left', 'right'
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const alignments = {
    left: 'left-0 mt-2',
    right: 'right-0 mt-2',
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-30 w-56 rounded-[18px] border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 shadow-premium-lg focus:outline-none py-1 overflow-hidden animate-fade-in origin-top-right',
            alignments[align],
            className
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className,
  danger = false,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2 text-sm transition-colors text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none',
        danger && 'text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-950/20',
        className
      )}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};

export default Dropdown;
