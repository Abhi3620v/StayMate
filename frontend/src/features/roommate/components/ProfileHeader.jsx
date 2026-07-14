import React, { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import CompatibilityBadge from './CompatibilityBadge';
import { Heart, Flag, ShieldCheck, Mail, Users, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import ReputationBadge from '@/modules/review/components/ReputationBadge';

export const ProfileHeader = ({
  profile,
  compatibilityScore,
  isFavorited,
  onToggleFavorite,
  onSendRequest,
  onReportClick,
  activeRequestStatus, // 'pending', 'accepted', 'rejected', 'none'
  onCancelRequest,
}) => {
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestInput, setShowRequestInput] = useState(false);

  const formattedBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(profile.budget?.monthlyRent || 0);

  const userObj = profile.userId || {};
  const name = userObj.name || 'Roommate User';
  const avatar = profile.profilePicture || userObj.avatar || '';

  const renderConnectionButton = () => {
    if (activeRequestStatus === 'accepted') {
      return (
        <Button variant="success" size="md" className="flex items-center space-x-2 font-bold cursor-default select-none">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>Connected</span>
        </Button>
      );
    }

    if (activeRequestStatus === 'pending') {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="md" className="flex items-center space-x-2 font-bold cursor-default select-none">
            <Clock className="h-4.5 w-4.5" />
            <span>Pending Request</span>
          </Button>
          {onCancelRequest && (
            <Button variant="outline" size="md" className="text-xs font-bold text-error-600 border-error-200 hover:bg-error-50 dark:hover:bg-error-950/20" onClick={onCancelRequest}>
              Cancel
            </Button>
          )}
        </div>
      );
    }

    if (showRequestInput) {
      return (
        <div className="flex flex-col space-y-2 w-full max-w-sm mt-3">
          <textarea
            placeholder="Introduce yourself or leave a message... (optional)"
            className="w-full text-xs p-3 border border-secondary-200 dark:border-secondary-800 rounded-xl bg-white dark:bg-secondary-950 focus:outline-none focus:ring-1 focus:ring-primary-500 text-secondary-900 dark:text-white"
            rows="2"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold flex-1"
              onClick={() => {
                onSendRequest(requestMessage);
                setShowRequestInput(false);
              }}
            >
              Send Request
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold flex-1"
              onClick={() => setShowRequestInput(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Button variant="primary" size="md" className="flex items-center space-x-2 font-bold" onClick={() => setShowRequestInput(true)}>
        <Users className="h-4.5 w-4.5" />
        <span>Request to Match</span>
      </Button>
    );
  };

  return (
    <div className="bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-3xl p-6 md:p-8 shadow-premium-sm transition-colors relative overflow-hidden">
      {/* Dynamic background effect */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/5 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Avatar + Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="relative select-none shrink-0">
            <Avatar src={avatar} name={name} size="2xl" className="border-4 border-white dark:border-secondary-900 shadow-premium-md rounded-2xl" />
            {profile.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-white dark:bg-secondary-900 rounded-full p-1 shadow-premium-md border border-secondary-100/10">
                <ShieldCheck className="h-6 w-6 text-success-600 dark:text-success-400 fill-white dark:fill-secondary-900 stroke-[1.8]" />
              </span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-secondary-900 dark:text-white tracking-tight">
                {name}
              </h1>
              {compatibilityScore !== undefined && (
                <CompatibilityBadge score={compatibilityScore} size="sm" />
              )}
            </div>

            <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 capitalize tracking-wide">
              {profile.basicInfo?.occupation} • {profile.basicInfo?.age} yrs • {profile.basicInfo?.gender}
            </p>

            <p className="text-xs text-secondary-400 dark:text-secondary-500 font-medium">
              Preferred Area: <span className="font-bold text-secondary-600 dark:text-secondary-400">{profile.locationPreferences?.area}, {profile.locationPreferences?.city}</span>
            </p>

            <div className="pt-0.5">
              <ReputationBadge userId={userObj._id || userObj.id} />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {profile.languagesSpoken?.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider rounded-md border border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-950 text-secondary-600 dark:text-secondary-400"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Price Budget + CTAs */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-end justify-between self-stretch shrink-0 gap-6">
          <div className="text-center md:text-right">
            <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-extrabold uppercase tracking-widest block">
              Budget Preference
            </span>
            <span className="text-2xl font-black text-secondary-900 dark:text-white mt-1 block">
              {formattedBudget}
              <span className="text-xs font-bold text-secondary-400 block sm:inline"> / month</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full sm:w-auto">
            {/* Connection control button */}
            {renderConnectionButton()}

            {/* Favorite toggle */}
            <Button
              variant="outline"
              size="md"
              className={cn(
                'p-3 border-secondary-200 dark:border-secondary-800 hover:shadow-premium-sm transition-all duration-300',
                isFavorited && 'bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
              )}
              onClick={onToggleFavorite}
              aria-label="Save Roommate Profile"
            >
              <Heart className={cn('h-5 w-5', isFavorited && 'fill-rose-500')} />
            </Button>

            {/* Flag Report button */}
            <Button
              variant="outline"
              size="md"
              className="p-3 border-secondary-200 dark:border-secondary-800 text-secondary-400 hover:text-error-500 hover:border-error-200 dark:hover:bg-error-950/20 transition-all duration-300"
              onClick={onReportClick}
              aria-label="Report Profile"
            >
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
