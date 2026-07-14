import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

/**
 * Reusable layout box to present dashboard numerical performance stats.
 */
const DashboardStatCard = ({
  className,
  title,
  value,
  icon,
  change, // Object: { value, type: 'increase' | 'decrease' | 'neutral' }
  description,
}) => {
  return (
    <Card className={cn('p-5 flex items-start justify-between relative', className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-extrabold text-secondary-900 dark:text-white">
          {value}
        </h3>
        
        <div className="flex items-center space-x-1.5 pt-1.5">
          {change && (
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border',
                change.type === 'increase' && 'bg-success-50 text-success-700 border-success-200 dark:bg-success-950/20 dark:text-success-400 dark:border-success-800',
                change.type === 'decrease' && 'bg-error-50 text-error-700 border-error-200 dark:bg-error-950/20 dark:text-error-400 dark:border-error-800',
                change.type === 'neutral' && 'bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-800 dark:text-secondary-400 dark:border-secondary-700'
              )}
            >
              {change.type === 'increase' ? '+' : ''}
              {change.value}
            </span>
          )}
          {description && (
            <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-medium">
              {description}
            </span>
          )}
        </div>
      </div>

      {icon && (
        <div className="h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-primary-100 dark:border-primary-900/50">
          {icon}
        </div>
      )}
    </Card>
  );
};

export default DashboardStatCard;
