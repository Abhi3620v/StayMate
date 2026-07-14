import React from 'react';
import RoommateCardSkeleton from './RoommateCardSkeleton';
import { cn } from '@/utils/cn';

/**
 * Grid-aligned layout loader of multiple RoommateCardSkeletons
 */
const RoommateGridSkeleton = ({ count = 6, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <RoommateCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default RoommateGridSkeleton;
