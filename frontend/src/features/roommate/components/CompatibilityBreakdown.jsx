import React from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import { Wallet, MapPin, Smile, Briefcase, Languages, Calendar } from 'lucide-react';

export const CompatibilityBreakdown = ({ breakdown = {} }) => {
  const categories = [
    {
      key: 'budget',
      label: 'Budget compatibility',
      icon: Wallet,
      color: 'bg-emerald-500',
      data: breakdown.budget || { score: 0, max: 20 },
    },
    {
      key: 'location',
      label: 'Location preferences',
      icon: MapPin,
      color: 'bg-sky-500',
      data: breakdown.location || { score: 0, max: 20 },
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle matches',
      icon: Smile,
      color: 'bg-amber-500',
      data: breakdown.lifestyle || { score: 0, max: 35 },
    },
    {
      key: 'occupation',
      label: 'Occupation check',
      icon: Briefcase,
      color: 'bg-indigo-500',
      data: breakdown.occupation || { score: 0, max: 10 },
    },
    {
      key: 'language',
      label: 'Spoken language overlap',
      icon: Languages,
      color: 'bg-rose-500',
      data: breakdown.language || { score: 0, max: 10 },
    },
    {
      key: 'moveInDate',
      label: 'Timeline alignment',
      icon: Calendar,
      color: 'bg-teal-500',
      data: breakdown.moveInDate || { score: 0, max: 5 },
    },
  ];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const percentage = Math.round((cat.data.score / cat.data.max) * 100);

        return (
          <div key={cat.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2 text-secondary-700 dark:text-secondary-300">
                <Icon className="h-4 w-4 text-secondary-400 shrink-0" />
                <span>{cat.label}</span>
              </div>
              <span className="text-secondary-900 dark:text-white">
                {cat.data.score} / {cat.data.max} pts ({percentage}%)
              </span>
            </div>
            <ProgressBar
              value={percentage}
              color={cat.color}
              size="xs"
              className="bg-secondary-100 dark:bg-secondary-800 rounded-full"
            />
          </div>
        );
      })}
    </div>
  );
};

export default CompatibilityBreakdown;
