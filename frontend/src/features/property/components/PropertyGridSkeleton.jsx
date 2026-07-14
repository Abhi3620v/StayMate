import React from 'react';
import PropertyCardSkeleton from './PropertyCardSkeleton';
import { cn } from '@/utils/cn';

/**
 * Grid-aligned layout loader of multiple PropertyCardSkeletons
 */
const PropertyGridSkeleton = ({ count = 6, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <PropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default PropertyGridSkeleton;
