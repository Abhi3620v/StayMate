import React from 'react';
import { UserCheck, UserPlus, Info, Check, X, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ProfileTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-secondary-400 italic">
        No recent activity logged.
      </div>
    );
  }

  const getActivityConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          icon: UserCheck,
          color: 'text-success-600 bg-success-50 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-900',
          text: 'Connected with roommate',
        };
      case 'pending':
        return {
          icon: UserPlus,
          color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/20 dark:text-primary-400 border-primary-200 dark:border-primary-900',
          text: 'Request initiated',
        };
      case 'rejected':
        return {
          icon: X,
          color: 'text-error-600 bg-error-50 dark:bg-error-950/20 dark:text-error-400 border-error-200 dark:border-error-900',
          text: 'Request declined',
        };
      case 'cancelled':
        return {
          icon: X,
          color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-900/60 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800',
          text: 'Request cancelled',
        };
      default:
        return {
          icon: Info,
          color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-800/60 border-secondary-200',
          text: 'Status updated',
        };
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const config = getActivityConfig(activity.status);
          const Icon = config.icon;
          const date = new Date(activity.updatedAt || activity.createdAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const isLast = idx === activities.length - 1;

          // Resolve recipient/sender labels
          const senderName = activity.senderId?.name || 'You';
          const receiverName = activity.receiverId?.name || 'Companion';

          return (
            <li key={activity._id || idx}>
              <div className="relative pb-8">
                {/* Connector line */}
                {!isLast && (
                  <span
                    className="absolute left-4.5 top-9 -ml-px h-full w-0.5 bg-secondary-200 dark:bg-secondary-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3.5">
                  <div>
                    <span
                      className={cn(
                        'h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0',
                        config.color
                      )}
                    >
                      <Icon className="h-4 w-4 stroke-[2]" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-xs text-secondary-600 dark:text-secondary-300 font-semibold">
                        {config.text}:{' '}
                        <span className="font-extrabold text-secondary-900 dark:text-white">
                          {senderName} → {receiverName}
                        </span>
                      </p>
                      {activity.message && (
                        <p className="text-[10px] text-secondary-400 dark:text-secondary-500 italic mt-0.5">
                          "{activity.message}"
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[10px] whitespace-nowrap text-secondary-400 font-medium">
                      <time>{date}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProfileTimeline;
