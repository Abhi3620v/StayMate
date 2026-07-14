import React, { useEffect, useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { ShieldCheck, Info } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export const ReputationBadge = ({ userId, className }) => {
  const { fetchReputation } = useReview();
  const [data, setData] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchReputation(userId).then(res => setData(res));
    }
  }, [userId]);

  if (!data) return null;

  const { score = 50, level = 'Fair', breakdown = {} } = data;

  const badgeColors = {
    'Outstanding': 'bg-success-50 text-success-650 border-success-200 dark:bg-success-950/20 dark:border-success-900',
    'Excellent': 'bg-indigo-50 text-indigo-650 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900',
    'Good': 'bg-primary-50 text-primary-650 border-primary-200 dark:bg-primary-950/20 dark:border-primary-900',
    'Fair': 'bg-warning-50 text-warning-650 border-warning-200 dark:bg-warning-950/20 dark:border-warning-900',
    'Needs Improvement': 'bg-error-50 text-error-650 border-error-200 dark:bg-error-950/20 dark:border-error-900'
  };

  return (
    <div className={`relative flex items-center space-x-1.5 ${className}`}>
      <Badge
        variant="outline"
        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl flex items-center border select-none ${
          badgeColors[level] || badgeColors.Fair
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5 mr-1 shrink-0" />
        Reputation: {score} ({level})
      </Badge>

      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-secondary-400 hover:text-secondary-600 focus:outline-none shrink-0"
        aria-label="Reputation score explanation"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {showTooltip && (
        <Card className="absolute bottom-7 left-0 md:left-auto md:right-0 z-25 w-60 p-4 border border-secondary-200/60 dark:border-secondary-800 shadow-2xl bg-white dark:bg-secondary-950 rounded-2xl text-[11px] font-medium text-secondary-650 dark:text-secondary-400 space-y-2.5 leading-relaxed">
          <h5 className="font-extrabold text-secondary-900 dark:text-white border-b pb-1 text-xs">
            Reputation Score Details
          </h5>
          <p>
            StayMate calculates trust levels dynamically based on verified platform interactions and safety logs.
          </p>
          <div className="space-y-1 text-[10px] font-bold text-secondary-500">
            <div className="flex justify-between">
              <span>Base Baseline:</span>
              <span className="text-secondary-900 dark:text-white">+{breakdown.base || 50}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Rating Score:</span>
              <span className="text-secondary-900 dark:text-white">+{breakdown.rating || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Profile Completion:</span>
              <span className="text-secondary-900 dark:text-white">+{breakdown.profileCompletion || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Verification Status:</span>
              <span className="text-secondary-900 dark:text-white">+{breakdown.verification || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Interactions Tour/Match:</span>
              <span className="text-secondary-900 dark:text-white">+{breakdown.interactions || 0}</span>
            </div>
            {breakdown.penalties < 0 && (
              <div className="flex justify-between text-error-500">
                <span>Penalties/Flags:</span>
                <span>{breakdown.penalties}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1.5 font-extrabold text-secondary-900 dark:text-white">
              <span>Total Score:</span>
              <span>{score}/100</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReputationBadge;
