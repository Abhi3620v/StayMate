import React from 'react';
import Select from '@/components/ui/Select';
import { Image, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ReviewFilters = ({ filters, onChange }) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest Reviews' },
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'highest', label: 'Highest Ratings' },
    { value: 'lowest', label: 'Lowest Ratings' },
    { value: 'oldest', label: 'Oldest Reviews' },
  ];

  const handleSortChange = (e) => {
    onChange({ sort: e.target.value });
  };

  const handleTogglePhotos = () => {
    onChange({ photosOnly: !filters.photosOnly });
  };

  const handleToggleVerified = () => {
    onChange({ verifiedOnly: !filters.verifiedOnly });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900/20 rounded-2xl text-xs font-semibold text-secondary-500 dark:text-secondary-400 select-none">
      
      {/* 1. Toggle controls */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleToggleVerified}
          className={cn(
            'flex items-center space-x-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 font-bold shadow-premium-sm text-xs',
            filters.verifiedOnly
              ? 'bg-success-50 text-success-650 border-success-250 dark:bg-success-950/20 dark:border-success-900'
              : 'bg-transparent border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-900/50'
          )}
        >
          <ShieldCheck className="h-5 w-5 text-success-600 shrink-0" />
          <span>Verified Reviews Only</span>
        </button>

        <button
          type="button"
          onClick={handleTogglePhotos}
          className={cn(
            'flex items-center space-x-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 font-bold shadow-premium-sm text-xs',
            filters.photosOnly
              ? 'bg-primary-50 text-primary-650 border-primary-250 dark:bg-primary-950/20 dark:border-primary-900'
              : 'bg-transparent border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-900/50'
          )}
        >
          <Image className="h-5 w-5 text-primary-500 shrink-0" />
          <span>Has Photos</span>
        </button>
      </div>

      {/* 2. Sort dropdown selection */}
      <div className="flex items-center space-x-2 shrink-0">
        <span className="text-[10px] text-secondary-400 uppercase font-black tracking-wider">Sort by</span>
        <select
          value={filters.sort || 'newest'}
          onChange={handleSortChange}
          className="text-xs px-3 py-1.5 border border-secondary-200 dark:border-secondary-800 rounded-xl bg-white dark:bg-secondary-900 focus:outline-none focus:ring-1 focus:ring-primary-500 text-secondary-900 dark:text-white font-extrabold cursor-pointer"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReviewFilters;
