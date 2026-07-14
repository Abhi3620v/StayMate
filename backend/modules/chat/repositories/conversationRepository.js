import Conversation from '../../../models/Conversation.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

let mockConversations = [];

class ConversationRepository {
  async create(data) {
    if (isDbConnected()) {
      const conv = await Conversation.create(data);
      return await conv.populate('participants', 'name email avatar');
    } else {
      const newConv = {
        _id: 'conv-' + Math.random().toString(36).substr(2, 9),
        ...data,
        unreadCounts: data.unreadCounts || new Map(),
        status: data.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockConversations.push(newConv);
      return newConv;
    }
  }

  async findById(id) {
    if (isDbConnected()) {
      return await Conversation.findById(id)
        .populate('participants', 'name email avatar')
        .populate('lastMessage');
    } else {
      return mockConversations.find(c => String(c._id) === String(id));
    }
  }

  async findByParticipants(type, participantIds) {
    if (isDbConnected()) {
      // Find conversation where participants matches exactly
      return await Conversation.findOne({
        type,
        participants: { $all: participantIds, $size: participantIds.length }
      })
      .populate('participants', 'name email avatar')
      .populate('lastMessage');
    } else {
      const ids = participantIds.map(String).sort();
      return mockConversations.find(c => {
        if (c.type !== type) return false;
        const pIds = c.participants.map(String).sort();
        return pIds.length === ids.length && pIds.every((v, i) => v === ids[i]);
      });
    }
  }

  async findUserConversations(userId) {
    if (isDbConnected()) {
      return await Conversation.find({
        participants: userId,
        status: 'active',
      })
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    } else {
      const uid = String(userId);
      return mockConversations
        .filter(c => c.participants.map(String).includes(uid) && c.status === 'active')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  }

  async updateLastMessage(conversationId, messageId) {
    if (isDbConnected()) {
      return await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: messageId },
        { new: true }
      );
    } else {
      const conv = mockConversations.find(c => String(c._id) === String(conversationId));
      if (conv) {
        conv.lastMessage = messageId;
        conv.updatedAt = new Date();
      }
      return conv;
    }
  }

  async incrementUnreadCount(conversationId, senderId) {
    if (isDbConnected()) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) return null;
      
      const unread = conv.unreadCounts || new Map();
      conv.participants.forEach(p => {
        const pid = String(p);
        if (pid !== String(senderId)) {
          const current = unread.get(pid) || 0;
          unread.set(pid, current + 1);
        }
      });
      conv.unreadCounts = unread;
      await conv.save();
      return conv;
    } else {
      const conv = mockConversations.find(c => String(c._id) === String(conversationId));
      if (conv) {
        conv.unreadCounts = conv.unreadCounts || new Map();
        conv.participants.forEach(p => {
          const pid = String(p);
          if (pid !== String(senderId)) {
            const current = conv.unreadCounts.get(pid) || 0;
            conv.unreadCounts.set(pid, current + 1);
          }
        });
        conv.updatedAt = new Date();
      }
      return conv;
    }
  }

  async resetUnreadCount(conversationId, userId) {
    if (isDbConnected()) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) return null;
      
      const unread = conv.unreadCounts || new Map();
      unread.set(String(userId), 0);
      conv.unreadCounts = unread;
      await conv.save();
      return conv;
    } else {
      const conv = mockConversations.find(c => String(c._id) === String(conversationId));
      if (conv) {
        conv.unreadCounts = conv.unreadCounts || new Map();
        conv.unreadCounts.set(String(userId), 0);
      }
      return conv;
    }
  }

  // Clear mock data for testing
  clearMock() {
    mockConversations = [];
  }
}

export default new ConversationRepository();
