import React from 'react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import CompatibilityBadge from './CompatibilityBadge';
import { Mail, Check, X, Calendar, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export const RequestCard = ({
  request,
  type = 'received', // 'received' or 'sent'
  onAccept,
  onReject,
  onCancel,
}) => {
  const { createConversation } = useChat();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const isReceived = type === 'received';
  const profile = isReceived ? request.senderProfile : request.receiverProfile;
  const user = isReceived ? request.senderId : request.receiverId;

  if (!profile || !user) return null;

  const formattedBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(profile.budget?.monthlyRent || 0);

  const name = user.name || 'Roommate User';
  const avatar = profile.profilePicture || user.avatar || '';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400 border border-success-105/10">
            Accepted
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-105/10">
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md bg-error-50 dark:bg-error-950/20 text-error-600 dark:text-error-400 border border-error-105/10">
            Rejected
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider rounded-md bg-secondary-100 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 border border-secondary-200/10">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleChatClick = async () => {
    try {
      const roommateId = user._id || user.id;
      const currentUserId = currentUser.id || currentUser._id;
      await createConversation(
        'roommate',
        roommateId,
        'User',
        [currentUserId, roommateId]
      );
      toast.success('Starting chat...');
      navigate(window.location.pathname.startsWith('/tenant') ? '/tenant/chat' : '/chat');
    } catch (err) {
      toast.error('Failed to start chat.');
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 rounded-2xl shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          {/* Profile details */}
          <div className="flex items-start space-x-3 min-w-0">
            <Avatar src={avatar} name={name} size="lg" className="rounded-xl shrink-0" />
            <div className="min-w-0">
              <Link
                to={`/roommates/${profile._id}`}
                className="font-extrabold text-sm text-secondary-900 dark:text-white hover:text-primary-650 transition-colors line-clamp-1 block"
              >
                {name}
              </Link>
              <p className="text-[10px] font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-widest mt-0.5">
                {profile.basicInfo?.occupation} • {profile.basicInfo?.age} yrs • {profile.basicInfo?.gender}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5 font-semibold">
                Budget: <span className="font-bold text-secondary-900 dark:text-white">{formattedBudget}</span>
              </p>
            </div>
          </div>

          {/* Compatibility badge */}
          {isReceived && request.senderProfile?.compatibilityScore !== undefined && (
            <CompatibilityBadge score={request.senderProfile.compatibilityScore} size="sm" showLabel={false} className="shrink-0" />
          )}
          {!isReceived && request.receiverProfile?.compatibilityScore !== undefined && (
            <CompatibilityBadge score={request.receiverProfile.compatibilityScore} size="sm" showLabel={false} className="shrink-0" />
          )}
        </div>

        {/* Message Box */}
        {request.message && (
          <div className="p-3 bg-secondary-50 dark:bg-secondary-950/40 rounded-xl border border-secondary-200/40 dark:border-secondary-800/40 text-[11px] text-secondary-650 dark:text-secondary-450 italic flex items-start space-x-1.5 leading-relaxed font-medium">
            <MessageCircle className="h-3.5 w-3.5 text-secondary-400 shrink-0 mt-0.5" />
            <span>"{request.message}"</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="mt-4 pt-3.5 border-t border-secondary-100 dark:border-secondary-800/80 flex flex-wrap items-center justify-between gap-3 text-[10px] text-secondary-400 font-bold">
        <span className="flex items-center space-x-2 shrink-0 select-none">
          <span className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Sent {new Date(request.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
          {getStatusBadge(request.status)}
        </span>

        <div className="flex space-x-2 shrink-0">
          {request.status === 'accepted' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] py-1.5 px-3 border-primary-500 text-primary-650 hover:bg-primary-50 font-bold flex items-center"
              onClick={handleChatClick}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              Message
            </Button>
          ) : request.status === 'pending' ? (
            isReceived ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] py-1.5 px-3 border-secondary-200 dark:border-secondary-800 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/20 font-bold"
                  onClick={onReject}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="text-[10px] py-1.5 px-3 font-bold"
                  onClick={onAccept}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Accept
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] py-1.5 px-3 border-secondary-200 dark:border-secondary-800 text-secondary-500 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 font-bold"
                onClick={onCancel}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel Request
              </Button>
            )
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default RequestCard;
