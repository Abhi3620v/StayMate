import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Basic viewport wrapper for error page displays
 */
const ErrorLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 px-4 transition-colors">
      <div className="w-full max-w-md text-center py-12 px-6 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-md">
        <Outlet />
      </div>
    </div>
  );
};

export default ErrorLayout;
