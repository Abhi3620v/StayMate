import React, { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import MessageMenu from './MessageMenu';
import { Check, CheckCheck, FileText, Download, Reply } from 'lucide-react';
import { cn } from '@/utils/cn';

export const MessageBubble = ({
  message,
  currentUserId,
  senderUser = {},
  onEdit,
  onDelete,
  onReport,
  onReplySelect,
}) => {
  const isMe = message.senderId
    ? String(message.senderId._id || message.senderId) === String(currentUserId)
    : false;
  const isSystem = message.type === 'system';
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(message._id, editText);
    setIsEditing(false);
  };

  // Format message time
  const getFormattedTime = () => {
    const date = new Date(message.createdAt);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // 1. RENDER SYSTEM MESSAGES
  if (isSystem) {
    return (
      <div className="flex justify-center my-4 w-full select-none">
        <span className="px-3.5 py-1.5 bg-secondary-105/85 dark:bg-secondary-800 text-[10.5px] font-bold text-secondary-500 dark:text-secondary-400 rounded-full border border-secondary-200/50 dark:border-secondary-700/50 shadow-premium-sm text-center max-w-md">
          {message.text}
        </span>
      </div>
    );
  }

  // 2. RENDER MESSAGE BUBBLE
  const name = senderUser.name || 'Chat Participant';
  const avatar = senderUser.avatar || '';

  const renderStatusTicks = () => {
    if (!isMe) return null;
    if (message.status === 'read') {
      return <CheckCheck className="h-3.5 w-3.5 text-primary-500 shrink-0 stroke-[2]" />;
    }
    return <Check className="h-3.5 w-3.5 text-secondary-400 shrink-0 stroke-[2]" />;
  };

  // Resolve reply preview
  const replyMsg = message.replyTo;

  return (
    <div className={cn('flex items-end space-x-2 group my-3.5', isMe ? 'justify-end' : 'justify-start')}>
      
      {/* Participant Avatar for other users */}
      {!isMe && (
        <Avatar src={avatar} name={name} size="xs" className="mb-1 rounded-lg shrink-0 select-none border border-secondary-200/40" />
      )}

      {/* Bubble Container */}
      <div className="flex flex-col max-w-sm sm:max-w-md">
        
        {/* Reply Reference Preview */}
        {replyMsg && (
          <div className={cn(
            'px-3 py-1.5 text-[10px] bg-secondary-100/60 dark:bg-secondary-900 border-l-4 border-primary-500 text-secondary-500 dark:text-secondary-400 rounded-t-xl opacity-90 truncate leading-none',
            isMe ? 'mr-0 rounded-tl-xl' : 'ml-0 rounded-tr-xl'
          )}>
            <span className="font-black block text-[8px] uppercase tracking-wider text-primary-600 mb-0.5">Replying to:</span>
            {replyMsg.text || '📷 Attachment'}
          </div>
        )}

        <div className={cn(
          'relative p-3.5 shadow-premium-sm transition-all duration-300',
          isMe
            ? 'bg-primary-600 text-white rounded-2xl rounded-br-none'
            : 'bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 text-secondary-850 dark:text-secondary-150 rounded-2xl rounded-bl-none',
          replyMsg && (isMe ? 'rounded-tr-none' : 'rounded-tl-none')
        )}>
          {/* Inline Editor */}
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-white dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                rows="2"
              />
              <div className="flex justify-end space-x-1.5 text-[10px] font-bold">
                <button type="submit" className="px-2.5 py-1 bg-primary-700 text-white rounded-lg">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-2.5 py-1 bg-secondary-200 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 rounded-lg">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 break-words">
              {/* IMAGE ATTACHMENT */}
              {message.type === 'image' && message.attachmentUrl && (
                <div className="relative rounded-xl overflow-hidden max-h-60 border border-secondary-100 dark:border-secondary-800">
                  <img src={message.attachmentUrl} alt={message.attachmentName} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300 select-none" />
                </div>
              )}

              {/* FILE ATTACHMENT */}
              {message.type === 'file' && message.attachmentUrl && (
                <div className={cn(
                  'p-3 rounded-xl border flex items-center justify-between gap-3 text-xs',
                  isMe ? 'bg-primary-700 border-primary-800' : 'bg-secondary-50 dark:bg-secondary-950 border-secondary-200/50'
                )}>
                  <div className="flex items-center space-x-2 min-w-0">
                    <FileText className="h-5 w-5 text-primary-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-extrabold truncate text-xs">{message.attachmentName}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">
                        {message.attachmentSize ? `${Math.round(message.attachmentSize / 1024)} KB` : ''}
                      </p>
                    </div>
                  </div>
                  <a
                    href={message.attachmentUrl}
                    download={message.attachmentName}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0 text-white"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Text Message */}
              {message.text && (
                <p className="text-xs leading-relaxed font-semibold whitespace-pre-wrap">{message.text}</p>
              )}
            </div>
          )}

          {/* Footer stats metadata */}
          <div className={cn(
            'flex items-center justify-end space-x-1.5 mt-1.5 text-[8.5px] font-bold select-none',
            isMe ? 'text-primary-100' : 'text-secondary-400'
          )}>
            {message.isEdited && <span>(edited)</span>}
            <span>{getFormattedTime()}</span>
            {renderStatusTicks()}
          </div>
        </div>
      </div>

      {/* Bubble Action Controls (Ellipsis menu + Reply button) */}
      {!isEditing && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition-opacity duration-300">
          <button
            onClick={() => onReplySelect(message)}
            className="p-1 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
            title="Reply"
          >
            <Reply className="h-4 w-4 stroke-[1.8]" />
          </button>
          
          <MessageMenu
            isMe={isMe}
            isDeleted={message.isDeleted}
            onEdit={message.type === 'text' ? () => setIsEditing(true) : null}
            onDelete={onDelete}
            onReport={onReport}
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
