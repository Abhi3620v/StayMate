import React from 'react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import CompatibilityBadge from './CompatibilityBadge';
import { MessageSquare, UserX, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const MatchCard = ({
  match,
  onUnmatch,
}) => {
  const navigate = useNavigate();
  const { createConversation } = useChat();
  const { user: currentUser } = useAuth();
  const profile = match.companionProfile;
  const user = profile?.userId;

  if (!profile || !user) return null;

  const formattedBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(profile.budget?.monthlyRent || 0);

  const name = user.name || 'Roommate User';
  const avatar = profile.profilePicture || user.avatar || '';

  const handleStartChat = async () => {
    try {
      const roommateId = user._id || user.id;
      const currentUserId = currentUser.id || currentUser._id;
      await createConversation(
        'roommate',
        roommateId,
        'User',
        [currentUserId, roommateId]
      );
      toast.success(`Launching chat with ${name}...`);
      navigate('/tenant/chat');
    } catch (err) {
      toast.error('Failed to start chat.');
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-2xl shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          {/* Profile details */}
          <div className="flex items-start space-x-3.5 min-w-0">
            <Avatar src={avatar} name={name} size="lg" className="rounded-xl shrink-0 animate-pulse-once" />
            <div className="min-w-0">
              <Link
                to={`/roommates/${profile._id}`}
                className="font-extrabold text-sm text-secondary-900 dark:text-white hover:text-primary-650 transition-colors line-clamp-1 block flex items-center"
              >
                {name}
                <ExternalLink className="h-3 w-3 ml-1 text-secondary-400 shrink-0" />
              </Link>
              <p className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mt-0.5">
                {profile.basicInfo?.occupation} • {profile.basicInfo?.age} yrs • {profile.basicInfo?.gender}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5 font-semibold">
                Rent: <span className="font-bold text-secondary-900 dark:text-white">{formattedBudget}</span> in <span className="font-bold text-secondary-700 dark:text-secondary-300">{profile.locationPreferences?.city}</span>
              </p>
            </div>
          </div>

          {/* Compatibility badge */}
          {profile.compatibilityScore !== undefined && (
            <CompatibilityBadge score={profile.compatibilityScore} size="sm" showLabel={false} className="shrink-0" />
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-5 pt-3.5 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] py-1.5 px-3 border-secondary-200 dark:border-secondary-800 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/20 font-bold"
          onClick={onUnmatch}
        >
          <UserX className="h-3.5 w-3.5 mr-1" />
          Unmatch
        </Button>

        <Button
          variant="primary"
          size="sm"
          className="text-[10px] py-1.5 px-4 font-bold flex items-center space-x-1"
          onClick={handleStartChat}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Message</span>
        </Button>
      </div>
    </Card>
  );
};

export default MatchCard;
