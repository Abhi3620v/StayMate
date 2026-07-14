import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export const RatingStars = ({
  rating = 0,
  interactive = false,
  onChange,
  size = 'md',
  className
}) => {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => handleStarClick(star)}
            className={cn(
              'focus:outline-none transition-transform duration-150',
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size] || sizeClasses.md,
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-secondary-300 dark:text-secondary-700'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
