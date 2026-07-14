import React from 'react';
import Spinner from '../ui/Spinner';
import { cn } from '@/utils/cn';

/**
 * Section container focused loading indicator spinner
 */
const SectionLoader = ({ className, message = 'Loading section...' }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 space-y-3 min-h-[200px]', className)}>
      <Spinner size="md" color="primary" />
      {message && (
        <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
          {message}
        </p>
      )}
    </div>
  );
};

export default SectionLoader;
