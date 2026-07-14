import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000');
const API_URL = `${SOCKET_URL}/api/v1/chat`;

// Setup axios instance with bearer token authorization header
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  
  const socketRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  // Keep ref up to date for socket listeners closures
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Initialize socket connection on login
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
      return;
    }

    const token = localStorage.getItem('accessToken');
    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { userId: user.id || user._id },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Fetch initial conversation threads on connect
      fetchConversations();
    });

    socket.on('conversation_created', (conversation) => {
      setConversations(prev => {
        if (prev.some(c => String(c._id) === String(conversation._id))) return prev;
        return [conversation, ...prev];
      });
    });

    socket.on('message_received', (message) => {
      // Append message if it belongs to active conversation
      if (String(message.conversationId) === String(activeConversationIdRef.current)) {
        setMessages(prev => {
          if (prev.some(m => String(m._id) === String(message._id))) return prev;
          return [...prev, message];
        });
        // Auto mark read if conversation is open
        markAsRead(message.conversationId);
      }

      // Update conversations list summary
      setConversations(prev => {
        return prev.map(c => {
          if (String(c._id) === String(message.conversationId)) {
            const counts = c.unreadCounts || {};
            // Increment unread count for current user if conversation is not active
            if (String(c._id) !== String(activeConversationIdRef.current) && message.senderId && String(message.senderId._id || message.senderId) !== String(user.id || user._id)) {
              const currentUid = user.id || user._id;
              counts[currentUid] = (counts[currentUid] || 0) + 1;
            }
            return {
              ...c,
              lastMessage: message,
              unreadCounts: { ...counts },
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socket.on('message_edited', (data) => {
      if (String(data.conversationId) === String(activeConversationIdRef.current)) {
        setMessages(prev =>
          prev.map(m => (String(m._id) === String(data.messageId) ? { ...m, text: data.text, isEdited: true } : m))
        );
      }
    });

    socket.on('message_deleted', (data) => {
      if (String(data.conversationId) === String(activeConversationIdRef.current)) {
        setMessages(prev =>
          prev.map(m => (String(m._id) === String(data.messageId) ? { ...m, text: 'This message was deleted', isDeleted: true } : m))
        );
      }
    });

    socket.on('typing_status', (data) => {
      setTypingUsers(prev => {
        const room = prev[data.conversationId] || {};
        return {
          ...prev,
          [data.conversationId]: {
            ...room,
            [data.userId]: data.isTyping,
          },
        };
      });
    });

    socket.on('online_status', (data) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: {
          isOnline: data.isOnline,
          lastSeen: data.lastSeen || null,
        },
      }));
    });

    socket.on('read_receipt', (data) => {
      if (String(data.conversationId) === String(activeConversationIdRef.current)) {
        setMessages(prev =>
          prev.map(m => {
            if (m.senderId && String(m.senderId._id || m.senderId) === String(user.id || user._id)) {
              return { ...m, status: 'read' };
            }
            return m;
          })
        );
      }
    });

    socket.on('user_blocked', () => {
      toast.error('Messaging settings updated due to user relationship change.');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Sync active conversation messages
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
      // Join socket conversation room
      if (socketRef.current) {
        socketRef.current.emit('join_conversation', activeConversationId);
      }
    }
    return () => {
      if (activeConversationId && socketRef.current) {
        socketRef.current.emit('leave_conversation', activeConversationId);
      }
    };
  }, [activeConversationId]);

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/conversations`, getAuthHeaders());
      
      // De-duplicate conversations list defensively
      const uniqueConvs = [];
      const seenIds = new Set();
      (response.data.data || []).forEach(c => {
        const idStr = String(c._id);
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          uniqueConvs.push(c);
        }
      });
      
      setConversations(uniqueConvs);
      
      // Batch query online status for participants
      const participantIds = [];
      response.data.data?.forEach(c => {
        c.participants.forEach(p => {
          if (String(p._id) !== String(user.id || user._id)) participantIds.push(p._id);
        });
      });
      
      if (socketRef.current && participantIds.length > 0) {
        socketRef.current.emit('check_online_status', participantIds, (statusMap) => {
          const mapped = {};
          Object.keys(statusMap).forEach(uid => {
            mapped[uid] = { isOnline: statusMap[uid] };
          });
          setOnlineUsers(prev => ({ ...prev, ...mapped }));
        });
      }
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, getAuthHeaders());
      setMessages(response.data.data || []);
    } catch (err) {
      console.error('Failed to load chat history:', err.message);
      toast.error('Failed to load message history.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text, attachment = null, replyToId = null) => {
    if (!activeConversationId) return;
    try {
      const response = await axios.post(`${API_URL}/conversations/${activeConversationId}/messages`, {
        text,
        attachment,
        replyToId,
      }, getAuthHeaders());

      const newMsg = response.data.data;
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(newMsg._id))) return prev;
        return [...prev, newMsg];
      });

      // Update last message summary locally
      setConversations(prev =>
        prev.map(c => (c._id === activeConversationId ? { ...c, lastMessage: newMsg, updatedAt: new Date().toISOString() } : c))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );

      return newMsg;
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to send message.';
      toast.error(msg);
      throw err;
    }
  };

  const editMessage = async (messageId, text) => {
    try {
      const response = await axios.put(`${API_URL}/messages/${messageId}`, { text }, getAuthHeaders());
      setMessages(prev => prev.map(m => (m._id === messageId ? response.data.data : m)));
      toast.success('Message updated.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to edit message.');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/messages/${messageId}`, getAuthHeaders());
      setMessages(prev =>
        prev.map(m => (m._id === messageId ? { ...m, text: 'This message was deleted', isDeleted: true } : m))
      );
      toast.success('Message deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete message.');
    }
  };

  const createConversation = async (type, contextId, contextRef, participantIds) => {
    try {
      const response = await axios.post(`${API_URL}/conversations`, {
        type,
        contextId,
        contextRef,
        participantIds,
      }, getAuthHeaders());
      
      const conv = response.data.data;
      setConversations(prev => {
        if (prev.some(c => String(c._id) === String(conv._id))) return prev;
        return [conv, ...prev];
      });
      setActiveConversationId(conv._id);
      return conv;
    } catch (err) {
      toast.error('Failed to start chat conversation.');
      throw err;
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await axios.post(`${API_URL}/conversations/${conversationId}/read`, {}, getAuthHeaders());
      setConversations(prev =>
        prev.map(c => {
          if (c._id === conversationId) {
            const counts = c.unreadCounts || {};
            counts[user.id || user._id] = 0;
            return { ...c, unreadCounts: { ...counts } };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const blockUser = async (userId) => {
    try {
      await axios.post(`${API_URL}/block/${userId}`, {}, getAuthHeaders());
      toast.success('User blocked successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to block user.');
    }
  };

  const unblockUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/block/${userId}`, getAuthHeaders());
      toast.success('User unblocked successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to unblock user.');
    }
  };

  const reportChat = async (conversationId, messageId, reason, explanation) => {
    try {
      await axios.post(`${API_URL}/report`, {
        conversationId,
        messageId,
        reason,
        explanation,
      }, getAuthHeaders());
      toast.success('Report submitted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit report.');
    }
  };

  // Manage client typing state notification emitters
  const setTypingState = (isTyping) => {
    if (socketRef.current && activeConversationId) {
      socketRef.current.emit(isTyping ? 'typing_start' : 'typing_stop', activeConversationId);
    }
  };

  // Get total global unread count
  const globalUnreadCount = conversations.reduce((acc, c) => {
    if (!user) return acc;
    const count = c.unreadCounts?.[user.id || user._id] || 0;
    return acc + count;
  }, 0);

  return (
    <ChatContext.Provider
      value={{
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
        createConversation,
        markAsRead,
        blockUser,
        unblockUser,
        reportChat,
        setTypingState,
        globalUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
