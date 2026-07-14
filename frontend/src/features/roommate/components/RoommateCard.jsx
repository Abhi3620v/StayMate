import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CompatibilityBadge from './CompatibilityBadge';
import { ShieldCheck, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const RoommateCard = ({
  profile = {
    id: 'mock-rm-1',
    user: {
      name: 'Rohan Sharma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    age: 21,
    gender: 'male',
    occupation: 'student',
    budget: 3500,
    foodPreference: 'veg',
    smoking: false,
    drinking: false,
    compatibilityScore: 89,
    completionPercentage: 98,
    languages: ['Hindi', 'English'],
    sleepSchedule: '11 PM - 7 AM',
    bio: 'Looking for a clean flatmate to share an apartment in Noida. I mostly keep to myself but do enjoy coding sessions.',
    isVerified: true,
  },
  onMessageClick,
}) => {
  const navigate = useNavigate();

  const formattedBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(profile.budget);

  const handleRequestMatch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Compatibility match request sent to ${profile.user.name}!`);
  };

  return (
    <Card hoverable className="group p-5 flex flex-col justify-between h-full bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[20px] shadow-premium-sm hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-0.5">
      <Link to={`/roommates/${profile.id}`} className="flex flex-col h-full justify-between space-y-4">
        
        {/* Header Block */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0 select-none">
              <Avatar src={profile.user.avatar} name={profile.user.name} size="lg" className="rounded-[14px]" />
              {profile.isVerified && (
                <span className="absolute -bottom-1 -right-1 bg-success-500 text-white rounded-full p-0.5 shadow-md border border-white dark:border-secondary-900">
                  <ShieldCheck className="h-3.5 w-3.5 text-white stroke-[2.2]" />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white line-clamp-1 group-hover:text-primary-650 transition-colors">
                {profile.user.name}
              </h4>
              <p className="text-[9px] font-black text-secondary-500 dark:text-secondary-450 uppercase tracking-widest mt-0.5">
                {profile.occupation} • {profile.age} yrs • {profile.gender}
              </p>
            </div>
          </div>

          {/* Compatibility & Completion Badge column */}
          <div className="flex flex-col items-end space-y-1.5 shrink-0">
            <CompatibilityBadge score={profile.compatibilityScore} size="sm" showLabel={false} />
            <span className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border border-secondary-200/20 dark:border-secondary-750/30">
              {profile.completionPercentage || 98}% Strength
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-secondary-550 dark:text-secondary-400 line-clamp-2 leading-relaxed font-medium">
          {profile.bio}
        </p>

        {/* Lifestyle Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="px-2.5 py-0.5 bg-amber-100/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[9px] font-black uppercase tracking-wider rounded-full">
            {profile.foodPreference === 'veg' ? 'Veg' : profile.foodPreference === 'non-veg' ? 'Non-Veg' : 'Any Diet'}
          </span>
          <span className="px-2.5 py-0.5 bg-rose-100/60 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-[9px] font-black uppercase tracking-wider rounded-full">
            {profile.smoking ? 'Smoker' : 'Non-Smoker'}
          </span>
          <span className="px-2.5 py-0.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-[9px] font-black uppercase tracking-wider rounded-full">
            {profile.drinking ? 'Drinks' : 'No Drinks'}
          </span>
          <span className="px-2.5 py-0.5 bg-primary-100/60 dark:bg-primary-950/30 text-primary-850 dark:text-primary-300 text-[9px] font-black uppercase tracking-wider rounded-full capitalize">
            {profile.sleepSchedule?.replace('_', ' ')}
          </span>
        </div>

        {/* Spacing filler to keep layout items aligned */}
        <div className="flex-grow" />

        {/* Action controls */}
        <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] text-secondary-450 dark:text-secondary-400 font-extrabold uppercase tracking-wider">
              Budget Target
            </p>
            <p className="text-sm font-black text-secondary-900 dark:text-white mt-0.5">
              {formattedBudget}<span className="text-[10px] font-bold text-secondary-400">/mo</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold py-1.5 px-3 border-secondary-200 dark:border-secondary-800 hover:shadow-premium-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/roommates/${profile.id}`);
              }}
            >
              View
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold py-1.5 px-3"
              onClick={handleRequestMatch}
            >
              Match
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default RoommateCard;
