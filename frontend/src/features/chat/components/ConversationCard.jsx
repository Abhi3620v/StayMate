import React from 'react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Home, User, CalendarDays } from 'lucide-react';

export const ConversationCard = ({
  conversation,
  currentUserId,
  isActive,
  onClick,
  onlineStatus = {},
}) => {
  const otherParticipant = conversation.participants.find(p => String(p._id) !== String(currentUserId));
  if (!otherParticipant) return null;

  const name = otherParticipant.name || 'Chat Participant';
  const avatar = otherParticipant.avatar || '';
  const isOnline = onlineStatus.isOnline;

  const unreadCount = conversation.unreadCounts?.[currentUserId] || 0;

  // Resolve context type badge
  const renderTypeIcon = () => {
    switch (conversation.type) {
      case 'property':
        return <Home className="h-3 w-3 text-rose-500" />;
      case 'roommate':
        return <User className="h-3 w-3 text-indigo-500" />;
      case 'visit':
        return <CalendarDays className="h-3 w-3 text-success-500" />;
      default:
        return null;
    }
  };

  // Format message text
  const getMessagePreview = () => {
    const msg = conversation.lastMessage;
    if (!msg) return 'No messages yet';
    if (msg.isDeleted) return 'This message was deleted';
    if (msg.type === 'system') return msg.text;
    
    const sender = msg.senderId && String(msg.senderId._id || msg.senderId) === String(currentUserId) ? 'You: ' : '';
    if (msg.type === 'image') return `${sender}📷 Image`;
    if (msg.type === 'file') return `${sender}📁 File`;
    return `${sender}${msg.text}`;
  };

  // Format timestamp
  const getFormattedTime = () => {
    const dateStr = conversation.updatedAt || conversation.createdAt;
    if (!dateStr) return '';
    const date = new Date(dateStr);
    
    // Check if today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 flex items-start space-x-3 cursor-pointer transition-all duration-300 border-l-4 ${
        isActive
          ? 'bg-primary-50/45 dark:bg-primary-950/15 border-primary-600'
          : 'hover:bg-secondary-50/50 border-transparent'
      }`}
    >
      {/* Avatar + Online status dot */}
      <div className="relative shrink-0 select-none">
        <Avatar src={avatar} name={name} size="md" className="rounded-xl border border-secondary-200/50 dark:border-secondary-800" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success-550 ring-2 ring-white dark:ring-secondary-900" />
        )}
      </div>

      {/* Details body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className={`text-xs truncate text-secondary-900 dark:text-white ${isActive || unreadCount > 0 ? 'font-black' : 'font-extrabold'}`}>
              {name}
            </span>
            <span className="shrink-0 p-1 bg-secondary-100 dark:bg-secondary-800 rounded-md">
              {renderTypeIcon()}
            </span>
          </div>
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-bold shrink-0">
            {getFormattedTime()}
          </span>
        </div>

        <p className={`text-[11px] truncate leading-relaxed ${unreadCount > 0 ? 'font-bold text-secondary-900 dark:text-white' : 'text-secondary-450 dark:text-secondary-500'}`}>
          {getMessagePreview()}
        </p>
      </div>

      {/* Unread badge count */}
      {unreadCount > 0 && (
        <Badge variant="primary" size="sm" className="h-5 min-w-[20px] rounded-full shrink-0 flex items-center justify-center font-black animate-pulse text-[10px]">
          {unreadCount}
        </Badge>
      )}
    </div>
  );
};

export default ConversationCard;
