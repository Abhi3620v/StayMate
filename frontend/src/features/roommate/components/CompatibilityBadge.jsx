import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export const CompatibilityBadge = ({ score, size = 'md', className, showLabel = true }) => {
  const getMatchQualityLabel = (val) => {
    if (val >= 95) return 'Perfect Match';
    if (val >= 90) return 'Excellent Match';
    if (val >= 80) return 'Very Good Match';
    if (val >= 70) return 'Good Match';
    if (val >= 60) return 'Average Match';
    return 'Low Match';
  };

  const getBadgeStyles = (val) => {
    if (val >= 80) {
      return 'text-success-700 bg-success-50 border-success-200/60 dark:bg-success-950/15 dark:text-success-400 dark:border-success-900/40 shadow-sm';
    }
    if (val >= 60) {
      return 'text-warning-700 bg-warning-50 border-warning-200/60 dark:bg-warning-950/15 dark:text-warning-400 dark:border-warning-900/40 shadow-sm';
    }
    return 'text-secondary-750 bg-secondary-50 border-secondary-200/65 dark:bg-secondary-850/20 dark:text-secondary-300 dark:border-secondary-750/30 shadow-sm';
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[9px] rounded-lg',
    md: 'px-3 py-1.5 text-xs rounded-xl',
    lg: 'px-4 py-2 text-sm rounded-2xl',
  };

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      {showLabel && (
        <span className="text-[9.5px] font-black uppercase tracking-wider text-secondary-500 mb-1 select-none">
          {getMatchQualityLabel(score)}
        </span>
      )}
      <div
        className={cn(
          'inline-flex items-center justify-center border font-extrabold select-none transition-all duration-300',
          sizeStyles[size] || sizeStyles.md,
          getBadgeStyles(score)
        )}
      >
        <Sparkles className={cn(
          'mr-1 animate-pulse stroke-[2]',
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )} />
        <span>{score}% Match</span>
      </div>
    </div>
  );
};

export default CompatibilityBadge;
