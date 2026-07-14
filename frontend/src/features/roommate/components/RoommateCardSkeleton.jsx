import React from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Loading skeleton representation of a Roommate Card item.
 */
const RoommateCardSkeleton = () => {
  return (
    <Card className="flex flex-col h-full p-5 justify-between">
      <div>
        {/* Header Block placeholder */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 w-2/3">
            <Skeleton variant="circle" className="h-12 w-12" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-4/5 h-4" />
              <Skeleton variant="text" className="w-3/5 h-3" />
            </div>
          </div>
          <Skeleton variant="text" className="w-12 h-8 rounded-lg" />
        </div>

        {/* Bio paragraph placeholder */}
        <div className="space-y-2 mt-5">
          <Skeleton variant="text" className="w-full h-3" />
          <Skeleton variant="text" className="w-5/6 h-3" />
        </div>

        {/* Badges placeholder */}
        <div className="flex space-x-2 mt-5">
          <Skeleton variant="text" className="w-16 h-5 rounded-full" />
          <Skeleton variant="text" className="w-20 h-5 rounded-full" />
          <Skeleton variant="text" className="w-14 h-5 rounded-full" />
        </div>
      </div>

      {/* Footer action placeholder */}
      <div className="mt-6 pt-4 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton variant="text" className="w-12 h-2.5" />
          <Skeleton variant="text" className="w-20 h-5" />
        </div>
        <Skeleton variant="circle" className="h-9 w-9 rounded-lg" />
      </div>
    </Card>
  );
};

export default RoommateCardSkeleton;
