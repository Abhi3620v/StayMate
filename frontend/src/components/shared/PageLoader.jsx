import React from 'react';
import Spinner from '../ui/Spinner';

/**
 * Screen-wide loading overlay spinner
 */
const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-secondary-950/80 backdrop-blur-sm transition-colors">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated logo stub */}
        <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-md animate-bounce">
          S
        </div>
        <Spinner size="lg" color="primary" />
        <p className="text-sm font-semibold tracking-wide text-secondary-600 dark:text-secondary-400 animate-pulse">
          Loading StayMate...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
