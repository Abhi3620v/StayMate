import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Reusable layout content switcher tabs
 */
const Tabs = ({
  className,
  tabs = [], // Array of { value, label, icon }
  activeTab,
  onTabChange,
  fullWidth = false,
}) => {
  return (
    <div
      className={cn(
        'border-b border-secondary-200 dark:border-secondary-800 flex space-x-1.5 overflow-x-auto scrollbar-none',
        className
      )}
      role="tablist"
      aria-label="Content Tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'inline-flex items-center justify-center py-2.5 px-4 text-sm font-medium border-b-2 border-transparent text-secondary-500 hover:text-secondary-800 hover:border-secondary-300 dark:text-secondary-400 dark:hover:text-secondary-200 focus:outline-none transition-all whitespace-nowrap',
              isActive && 'border-primary-500 text-primary-700 dark:text-primary-400 dark:border-primary-400 font-semibold',
              fullWidth && 'flex-1',
              tab.className
            )}
          >
            {tab.icon && <span className="mr-2 shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
