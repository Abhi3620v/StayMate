import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import ConversationCard from './components/ConversationCard';
import MessageBubble from './components/MessageBubble';
import EmojiPicker from './components/EmojiPicker';
import AttachmentPreview from './components/AttachmentPreview';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import axios from 'axios';
import {
  Send,
  Paperclip,
  Search,
  ArrowLeft,
  Shield,
  Flag,
  MessageSquareOff,
  MoreVertical,
  Undo
} from 'lucide-react';
import toast from 'react-hot-toast';

const ChatIndex = () => {
  const { user } = useAuth();
  const {
    conversations,
    conversationsLoading,
    activeConversationId,
    setActiveConversationId,
    messages,
    loading,
    typingUsers,
    onlineUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    blockUser,
    unblockUser,
    reportChat,
    setTypingState,
  } = useChat();

  // Resolve current user ID once (auth returns 'id', not '_id')
  const currentUserId = user?.id || user?._id;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'unread', 'property', 'roommate', 'visit'
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  
  // Header Action Menu state
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Handle typing status notification
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    setTypingState(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setTypingState(false);
    }, 2000);
  };

  // Upload attachment file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Size check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    setSelectedFile(file);
  };

  // Clear file from preview tray
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Process sending message
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !selectedFile) return;

    let attachmentPayload = null;
    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/uploads/chat-attachment`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );
        attachmentPayload = response.data.data;
      } catch (err) {
        toast.error('File upload failed. Please try again.');
        setUploading(false);
        return;
      }
    }

    try {
      await sendMessage(messageText, attachmentPayload, replyMessage?._id);
      setMessageText('');
      setReplyMessage(null);
      clearSelectedFile();
      setTypingState(false);
    } catch (err) {
      // toast shown in context
    } finally {
      setUploading(false);
    }
  };

  // Handle emoji injection
  const handleEmojiSelect = (emoji) => {
    setMessageText(prev => prev + emoji);
  };

  // Block current conversation partner
  const handleBlockPartner = async (partnerId, partnerName) => {
    const confirm = window.confirm(`Are you sure you want to block ${partnerName}? You won't be able to exchange messages with each other.`);
    if (confirm) {
      await blockUser(partnerId);
      setIsHeaderMenuOpen(false);
    }
  };

  // Report chat
  const handleReportConversation = async (partnerName) => {
    const reason = window.prompt(`Report ${partnerName} for safety validation. Enter reason (spam, harassment, abuse, scam):`);
    if (!reason) return;
    const explanation = window.prompt(`Describe details of the report:`);
    if (!explanation) return;

    await reportChat(activeConversationId, null, reason.toLowerCase(), explanation);
    setIsHeaderMenuOpen(false);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const other = c.participants.find(p => String(p._id) !== String(currentUserId));
    if (!other) return false;

    // Search query match
    const matchesSearch = other.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Type query match
    if (filterType === 'unread') {
      return (c.unreadCounts?.[currentUserId] || 0) > 0;
    }
    if (filterType !== 'all') {
      return c.type === filterType;
    }
    return true;
  });

  const currentConversation = conversations.find(c => c._id === activeConversationId);
  const otherParticipant = currentConversation?.participants.find(p => String(p._id) !== String(currentUserId));

  // Check if other user is typing in current chat
  const isTyping = typingUsers[activeConversationId]?.[otherParticipant?._id];

  return (
    <Card className="h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] flex border-secondary-200 shadow-premium-md overflow-hidden bg-white dark:bg-secondary-900 rounded-[24px]">
      
      {/* LEFT PANEL: THREAD LIST */}
      <div className={`w-full md:w-80 border-r border-secondary-250 dark:border-secondary-800 flex flex-col shrink-0 ${
        activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search header */}
        <div className="p-4 border-b border-secondary-100 dark:border-secondary-800 shrink-0 space-y-3.5">
          <h3 className="font-black text-lg text-secondary-900 dark:text-white tracking-tight">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search chat thread..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-secondary-200/60 dark:border-secondary-800 rounded-xl bg-secondary-50/50 dark:bg-secondary-950 focus:outline-none focus:ring-1 focus:ring-primary-500 text-secondary-900 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-secondary-100 dark:border-secondary-800 shrink-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none select-none text-[10px] font-black uppercase tracking-wider text-secondary-400">
          {['all', 'unread', 'property', 'roommate', 'visit'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg border transition-all duration-300 shrink-0 ${
                filterType === t
                  ? 'bg-primary-50 text-primary-650 border-primary-200 dark:bg-primary-950/20 dark:border-primary-900'
                  : 'bg-transparent border-transparent hover:border-secondary-200 hover:text-secondary-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-secondary-100/50 dark:divide-secondary-800/80">
          {conversationsLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-secondary-100 dark:bg-secondary-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-secondary-100 dark:bg-secondary-800 rounded w-1/3" />
                  <div className="h-3 bg-secondary-100 dark:bg-secondary-800 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((c) => (
              <ConversationCard
                key={c._id}
                conversation={c}
                currentUserId={currentUserId}
                isActive={c._id === activeConversationId}
                onClick={() => setActiveConversationId(c._id)}
                onlineStatus={onlineUsers[c.participants.find(p => String(p._id) !== String(currentUserId))?._id] || {}}
              />
            ))
          ) : (
            <div className="text-center py-12 text-xs text-secondary-405 font-bold italic select-none">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT WINDOW */}
      <div className={`flex-1 flex flex-col bg-secondary-50/20 dark:bg-secondary-950/10 ${
        activeConversationId ? 'flex' : 'hidden md:flex'
      }`}>
        {currentConversation && otherParticipant ? (
          <>
            {/* Header */}
            <div className="h-[60px] bg-white dark:bg-secondary-900 border-b border-secondary-250 dark:border-secondary-800 flex items-center justify-between px-4 sm:px-6 shrink-0 transition-colors">
              <div className="flex items-center space-x-3">
                {/* Back button on mobile */}
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 dark:hover:bg-secondary-800 shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative select-none shrink-0">
                  <Avatar src={otherParticipant.avatar} name={otherParticipant.name} size="sm" className="rounded-xl border border-secondary-200/50" />
                  {onlineUsers[otherParticipant._id]?.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success-550 ring-2 ring-white dark:ring-secondary-900" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white leading-tight">
                    {otherParticipant.name}
                  </h4>
                  <p className="text-[10px] text-secondary-450 mt-0.5 select-none font-bold">
                    {onlineUsers[otherParticipant._id]?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Action Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                  className="p-2 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {isHeaderMenuOpen && (
                  <div className="absolute right-0 z-30 mt-1.5 w-44 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-800 shadow-premium-md py-1.5 text-xs text-secondary-700 dark:text-secondary-300 font-semibold select-none">
                    <button
                      onClick={() => handleBlockPartner(otherParticipant._id, otherParticipant.name)}
                      className="w-full text-left px-3.5 py-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-error-600 flex items-center space-x-2"
                    >
                      <MessageSquareOff className="h-4 w-4 shrink-0" />
                      <span>Block User</span>
                    </button>
                    <button
                      onClick={() => handleReportConversation(otherParticipant.name)}
                      className="w-full text-left px-3.5 py-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-warning-605 flex items-center space-x-2"
                    >
                      <Flag className="h-4 w-4 shrink-0" />
                      <span>Report Conversation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Message Area list */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
                      <div className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-2xl w-44" />
                    </div>
                  ))}
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    currentUserId={user?.id || user?._id}
                    senderUser={
                      msg.isSystem || !msg.senderId
                        ? null
                        : String(msg.senderId?._id || msg.senderId) === String(user?.id || user?._id)
                        ? user
                        : otherParticipant
                    }
                    onEdit={editMessage}
                    onDelete={() => {
                      if (window.confirm('Delete this message for everyone?')) {
                        deleteMessage(msg._id);
                      }
                    }}
                    onReport={() => {
                      const reason = window.prompt('Report message. Enter reason (spam, harassment, abuse, scam):');
                      if (!reason) return;
                      const exp = window.prompt('Describe details of the report:');
                      if (!exp) return;
                      reportChat(activeConversationId, msg._id, reason, exp);
                    }}
                    onReplySelect={setReplyMessage}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-xs font-bold text-secondary-400 italic select-none">
                  <span>Send a message to start conversation.</span>
                </div>
              )}

              {/* Typing notification indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-[10px] text-primary-600 dark:text-primary-400 font-extrabold animate-pulse my-1 pl-6">
                  <span>{otherParticipant.name} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Info Indicator Bar */}
            {replyMessage && (
              <div className="px-4 py-2 bg-secondary-100/65 dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800 flex items-center justify-between text-xs font-semibold select-none shrink-0 text-secondary-650 dark:text-secondary-400">
                <div className="flex items-center space-x-1.5 truncate">
                  <Undo className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                  <span className="truncate font-bold">Replying: "{replyMessage.text || '📷 Attachment'}"</span>
                </div>
                <button
                  onClick={() => setReplyMessage(null)}
                  className="p-1 rounded-full text-secondary-450 hover:text-error-650 hover:bg-error-50 dark:hover:bg-error-950/20 transition-all focus:outline-none"
                >
                  <ArrowLeft className="h-4 w-4 rotate-90" />
                </button>
              </div>
            )}

            {/* Attachment preview tray */}
            <AttachmentPreview file={selectedFile} onClear={clearSelectedFile} />

            {/* Input form */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white dark:bg-secondary-900 border-t border-secondary-250 dark:border-secondary-800 shrink-0 flex items-center gap-2.5 transition-colors"
            >
              {/* Emojis selection */}
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />

              {/* File Attachment paperclip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg text-secondary-400 hover:text-secondary-650 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
                title="Attach photo or document"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              />

              {/* Textbox input */}
              <div className="flex-1">
                <Input
                  placeholder={uploading ? 'Uploading attachment...' : 'Type a message...'}
                  value={messageText}
                  onChange={handleInputChange}
                  disabled={uploading}
                  className="text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={uploading || (!messageText.trim() && !selectedFile)}
                className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center shadow-premium-sm active:scale-95 transition-all p-0"
                variant="primary"
              >
                <Send className="h-4.5 w-4.5 stroke-[2.2]" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs font-semibold text-secondary-400 bg-secondary-50/10 dark:bg-secondary-950/5 select-none space-y-3">
            <div className="p-4 bg-white dark:bg-secondary-900 border border-secondary-200/50 dark:border-secondary-800 rounded-3xl shadow-premium-sm text-secondary-400">
              <Shield className="h-8 w-8 stroke-[1.8] text-primary-600 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-sm text-secondary-800 dark:text-secondary-200">Unified Messaging Terminal</h4>
            <p className="max-w-xs text-secondary-450 leading-relaxed font-medium">
              Select a conversation to start chatting. Coordinate listings, roommate matching preferences, and inspection schedules.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChatIndex;
