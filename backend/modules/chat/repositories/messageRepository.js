import Message from '../../../models/Message.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

let mockMessages = [];

class MessageRepository {
  async create(data) {
    if (isDbConnected()) {
      const msg = await Message.create(data);
      return await msg.populate([
        { path: 'senderId', select: 'name email avatar' },
        { path: 'replyTo' },
      ]);
    } else {
      const newMsg = {
        _id: 'msg-' + Math.random().toString(36).substr(2, 9),
        ...data,
        status: data.status || 'sent',
        readBy: data.readBy || [],
        isEdited: data.isEdited || false,
        isDeleted: data.isDeleted || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockMessages.push(newMsg);
      return newMsg;
    }
  }

  async findById(id) {
    if (isDbConnected()) {
      return await Message.findById(id)
        .populate('senderId', 'name email avatar')
        .populate('replyTo');
    } else {
      return mockMessages.find(m => String(m._id) === String(id));
    }
  }

  async findByConversationId(conversationId, options = {}) {
    const { limit = 50, beforeTimestamp } = options;
    if (isDbConnected()) {
      const query = { conversationId };
      if (beforeTimestamp) {
        query.createdAt = { $lt: new Date(beforeTimestamp) };
      }
      return await Message.find(query)
        .populate('senderId', 'name email avatar')
        .populate('replyTo')
        .sort({ createdAt: 1 }) // Chronological order
        .limit(limit);
    } else {
      let filtered = mockMessages.filter(m => String(m.conversationId) === String(conversationId));
      if (beforeTimestamp) {
        filtered = filtered.filter(m => new Date(m.createdAt) < new Date(beforeTimestamp));
      }
      return filtered
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-limit);
    }
  }

  async updateMessage(messageId, text) {
    if (isDbConnected()) {
      return await Message.findByIdAndUpdate(
        messageId,
        { text, isEdited: true },
        { new: true }
      ).populate('senderId', 'name email avatar');
    } else {
      const msg = mockMessages.find(m => String(m._id) === String(messageId));
      if (msg) {
        msg.text = text;
        msg.isEdited = true;
        msg.updatedAt = new Date();
      }
      return msg;
    }
  }

  async deleteMessage(messageId) {
    if (isDbConnected()) {
      return await Message.findByIdAndUpdate(
        messageId,
        { text: 'This message was deleted', isDeleted: true },
        { new: true }
      ).populate('senderId', 'name email avatar');
    } else {
      const msg = mockMessages.find(m => String(m._id) === String(messageId));
      if (msg) {
        msg.text = 'This message was deleted';
        msg.isDeleted = true;
        msg.updatedAt = new Date();
      }
      return msg;
    }
  }

  async markAsReadBy(messageId, userId) {
    if (isDbConnected()) {
      return await Message.findByIdAndUpdate(
        messageId,
        { 
          $addToSet: { readBy: userId },
          status: 'read'
        },
        { new: true }
      );
    } else {
      const msg = mockMessages.find(m => String(m._id) === String(messageId));
      if (msg) {
        if (!msg.readBy.map(String).includes(String(userId))) {
          msg.readBy.push(userId);
        }
        msg.status = 'read';
      }
      return msg;
    }
  }

  async markConversationMessagesAsRead(conversationId, userId) {
    if (isDbConnected()) {
      return await Message.updateMany(
        { conversationId, senderId: { $ne: userId } },
        {
          $addToSet: { readBy: userId },
          status: 'read'
        }
      );
    } else {
      mockMessages.forEach(m => {
        if (String(m.conversationId) === String(conversationId) && String(m.senderId) !== String(userId)) {
          if (!m.readBy.map(String).includes(String(userId))) {
            m.readBy.push(userId);
          }
          m.status = 'read';
        }
      });
      return { modifiedCount: 1 };
    }
  }

  clearMock() {
    mockMessages = [];
  }
}

export default new MessageRepository();
