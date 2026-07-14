import React from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Loading skeleton representation of a Property Card item.
 */
const PropertyCardSkeleton = () => {
  return (
    <Card className="flex flex-col h-full">
      {/* Cover Image placeholder */}
      <Skeleton variant="rect" className="aspect-[4/3] w-full rounded-none" />

      {/* Detail info placeholders */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-2/3 h-5" />
          <Skeleton variant="text" className="w-10 h-4" />
        </div>
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="pt-3 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between">
          <Skeleton variant="text" className="w-1/3 h-6" />
        </div>
      </div>
    </Card>
  );
};

export default PropertyCardSkeleton;
