import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const ProfileCompletionCard = ({
  percentage = 0,
  missingInformation = [],
  onEditClick,
}) => {
  const isComplete = percentage === 100;

  const generateBlockProgress = (pct) => {
    const filledCount = Math.round(pct / 10);
    const emptyCount = 10 - filledCount;
    return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-secondary-50/50 dark:from-secondary-900 dark:to-secondary-950 border border-secondary-200/50 dark:border-secondary-800 rounded-3xl shadow-premium-sm">
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">
              Profile Strength
            </h4>
            <p className="text-[10px] font-semibold text-secondary-400 dark:text-secondary-500">
              Better profiles get 3x higher match rates
            </p>
          </div>
        </div>

        {/* Block progress bar */}
        <div className="py-2.5 px-4 bg-secondary-50 dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-900 rounded-2xl flex items-center justify-between font-mono text-xs select-none">
          <span className="text-primary-600 dark:text-primary-400 tracking-wider">
            {generateBlockProgress(percentage)}
          </span>
          <span className="font-black text-secondary-900 dark:text-white">{percentage}%</span>
        </div>

        {/* List of missing info */}
        {missingInformation.length > 0 && !isComplete ? (
          <div className="space-y-2 text-xs">
            <span className="text-[10px] text-secondary-450 dark:text-secondary-500 font-extrabold uppercase tracking-wider block">
              Next Steps
            </span>
            <ul className="space-y-1.5 text-secondary-650 dark:text-secondary-400 pl-1 font-bold">
              {missingInformation.slice(0, 4).map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2 py-0.5">
                  <span className="text-primary-600 dark:text-primary-400 font-black text-sm shrink-0">+</span>
                  <span className="truncate">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-bold text-success-600 bg-success-50 dark:bg-success-950/20 dark:text-success-400 border border-success-100 dark:border-success-900/30 p-3 rounded-2xl">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>Your roommate profile is 100% complete!</span>
          </div>
        )}

        {/* Edit Action Button */}
        <div className="pt-2">
          <Button variant="primary" size="sm" className="w-full flex items-center justify-center space-x-2 font-bold py-2.5 rounded-xl" onClick={onEditClick}>
            <span>{isComplete ? 'Edit Profile Settings' : 'Complete My Profile'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCompletionCard;
