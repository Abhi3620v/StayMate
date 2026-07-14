import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export const StatisticsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400',
  className,
  onClick,
}) => {
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={cn(
        'p-5 flex items-center justify-between border border-secondary-200/50 dark:border-secondary-800 rounded-2xl bg-white dark:bg-secondary-900 shadow-premium-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-premium-md active:scale-[0.99]',
        className
      )}
    >
      <div className="space-y-1.5 min-w-0">
        <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-extrabold uppercase tracking-widest block truncate">
          {title}
        </span>
        <span className="text-2xl font-black text-secondary-900 dark:text-white block">
          {value}
        </span>
        {trend && (
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 block truncate font-medium">
            {trend}
          </span>
        )}
      </div>

      <div className={cn('p-3 rounded-xl shrink-0 ml-3', color)}>
        {Icon && <Icon className="h-5 w-5 stroke-[1.8]" />}
      </div>
    </Card>
  );
};

export default StatisticsCard;
