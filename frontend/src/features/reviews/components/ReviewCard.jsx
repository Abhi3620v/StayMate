import React from 'react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Star, ShieldCheck, ThumbsUp } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Reusable Card component to display multi-category ratings and comments.
 */
const ReviewCard = ({
  review = {
    id: 'mock-rev-1',
    user: {
      name: 'Aditya Sen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    },
    ratings: {
      overall: 5,
      cleanliness: 4.8,
      security: 5.0,
      internet: 4.5,
    },
    comment: 'The property exceeds expectations. Excellent connectivity, very quiet study environment, and the landlord was highly co-operative. Strongly recommended!',
    isVerifiedStay: true,
    likesCount: 6,
    createdAt: '2026-06-15T10:30:00.000Z',
  },
  onLikeClick,
}) => {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="p-5 flex flex-col space-y-4">
      {/* Reviewer Meta Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar src={review.user.avatar} name={review.user.name} size="md" />
          <div>
            <div className="flex items-center">
              <h5 className="font-bold text-sm text-secondary-900 dark:text-white mr-2">
                {review.user.name}
              </h5>
              {review.isVerifiedStay && (
                <Badge variant="success" size="sm" className="bg-success-50 text-success-700 py-0 px-1 text-[9px] border-none shrink-0 flex items-center">
                  <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                  Verified Stay
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-secondary-400">{formattedDate}</p>
          </div>
        </div>

        {/* Aggregate stars display */}
        <div className="flex items-center bg-warning-50 dark:bg-warning-950/20 text-warning-700 dark:text-warning-400 px-2 py-0.5 rounded-lg border border-warning-100 dark:border-warning-900/50">
          <Star className="h-3.5 w-3.5 fill-warning-500 text-warning-500 mr-1 shrink-0" />
          <span className="text-xs font-bold">{review.ratings.overall.toFixed(1)}</span>
        </div>
      </div>

      {/* Review Comment Content */}
      <p className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed">
        {review.comment}
      </p>

      {/* Category breakdown summary (collapsible or mini text) */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-secondary-50 dark:bg-secondary-900/50 rounded-lg border border-secondary-200/50 dark:border-secondary-800 text-[10px] text-secondary-500 dark:text-secondary-400">
        <div>
          <span className="font-semibold text-secondary-700 dark:text-secondary-300">Cleanliness:</span>{' '}
          {review.ratings.cleanliness.toFixed(1)}/5
        </div>
        <div>
          <span className="font-semibold text-secondary-700 dark:text-secondary-300">Security:</span>{' '}
          {review.ratings.security.toFixed(1)}/5
        </div>
        <div>
          <span className="font-semibold text-secondary-700 dark:text-secondary-300">Internet:</span>{' '}
          {review.ratings.internet.toFixed(1)}/5
        </div>
      </div>

      {/* Footer Like triggers */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onLikeClick && onLikeClick(review.id)}
          className="inline-flex items-center text-xs text-secondary-500 dark:text-secondary-400 hover:text-primary-600 transition-colors focus:outline-none"
        >
          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
          Helpful ({review.likesCount})
        </button>
      </div>
    </Card>
  );
};

export default ReviewCard;
