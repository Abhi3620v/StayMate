import React from 'react';
import RatingStars from './RatingStars';
import ProgressBar from '@/components/ui/ProgressBar';

export const RatingBreakdown = ({ stats }) => {
  const { averageRating = 0, totalReviews = 0, distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } = stats || {};

  const total = totalReviews || 1; // Prevent division by zero
  const rows = [5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-secondary-50/50 dark:bg-secondary-950/20 border border-secondary-200/50 dark:border-secondary-900 rounded-3xl">
      {/* Left panel: average score */}
      <div className="text-center shrink-0 py-2">
        <h4 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">
          {averageRating || '0.0'}
        </h4>
        <RatingStars rating={Math.round(averageRating)} size="sm" className="justify-center mt-1.5" />
        <span className="text-[10px] text-secondary-400 dark:text-secondary-500 uppercase tracking-widest font-black block mt-2">
          {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      {/* Right panel: progress bars breakdown */}
      <div className="flex-1 w-full space-y-2 text-xs font-semibold text-secondary-650 dark:text-secondary-400">
        {rows.map((stars) => {
          const count = distribution[stars] || 0;
          const pct = Math.round((count / total) * 100);

          return (
            <div key={stars} className="flex items-center space-x-3.5">
              <span className="w-3 text-right">{stars}</span>
              <div className="flex-1 h-2 rounded bg-secondary-100 dark:bg-secondary-800 overflow-hidden relative">
                <div
                  style={{ width: `${pct}%` }}
                  className="absolute top-0 bottom-0 left-0 bg-amber-400 rounded transition-all duration-300"
                />
              </div>
              <span className="w-8 text-right text-[10px] font-bold text-secondary-450">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingBreakdown;
