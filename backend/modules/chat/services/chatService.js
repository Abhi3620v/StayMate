import conversationRepository from '../repositories/conversationRepository.js';
import messageRepository from '../repositories/messageRepository.js';
import blockRepository from '../repositories/blockRepository.js';
import chatReportRepository from '../repositories/chatReportRepository.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../utils/errors.js';

class ChatService {
  /**
   * Fetches or initializes a conversation thread.
   */
  async getOrCreateConversation(type, contextId, contextRef, participantIds) {
    if (!type || !contextId || !contextRef || !participantIds || participantIds.length < 2) {
      throw new ValidationError('Conversation type, context, and at least two participants are required.');
    }

    // Sort to verify unique participant combos
    const uniqueIds = [...new Set(participantIds.map(String))];
    
    // Check if conversation already exists for this context
    let conv = await conversationRepository.findByParticipants(type, uniqueIds);
    if (!conv) {
      // Create new conversation
      const unreadMap = new Map();
      uniqueIds.forEach(id => unreadMap.set(String(id), 0));

      conv = await conversationRepository.create({
        type,
        contextId,
        contextRef,
        participants: uniqueIds,
        unreadCounts: unreadMap,
        status: 'active'
      });
    }

    return conv;
  }

  /**
   * Returns list of conversations for a user.
   */
  async getConversationsForUser(userId) {
    return await conversationRepository.findUserConversations(userId);
  }

  /**
   * Returns paginated messages for a conversation.
   */
  async getMessagesForConversation(conversationId, userId, options = {}) {
    const conv = await conversationRepository.findById(conversationId);
    if (!conv) {
      throw new NotFoundError('Conversation not found.');
    }

    // Verify user is a member
    const isMember = conv.participants.some(p => String(p._id || p) === String(userId));
    if (!isMember) {
      throw new ForbiddenError('You are not authorized to view this conversation.');
    }

    return await messageRepository.findByConversationId(conversationId, options);
  }

  /**
   * Sends a message to a conversation.
   */
  async sendMessage(conversationId, senderId, text, attachmentData = null, replyToId = null) {
    const conv = await conversationRepository.findById(conversationId);
    if (!conv) {
      throw new NotFoundError('Conversation not found.');
    }

    // Verify user is a member
    const isMember = conv.participants.some(p => String(p._id || p) === String(senderId));
    if (!isMember) {
      throw new ForbiddenError('You are not authorized to post in this conversation.');
    }

    // Check block status between participants
    const otherParticipants = conv.participants.filter(p => String(p._id || p) !== String(senderId));
    for (const other of otherParticipants) {
      const otherId = String(other._id || other);
      const isBlocked = await blockRepository.isBlocked(senderId, otherId);
      if (isBlocked) {
        throw new ForbiddenError('Messaging is restricted due to a user block.');
      }
    }

    let type = 'text';
    let attachmentUrl, attachmentName, attachmentSize;

    if (attachmentData) {
      attachmentUrl = attachmentData.url;
      attachmentName = attachmentData.name;
      attachmentSize = attachmentData.size;
      
      // Resolve attachment types
      const extension = attachmentName.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        type = 'image';
      } else {
        type = 'file';
      }
    }

    // Create the message
    const msg = await messageRepository.create({
      conversationId,
      senderId,
      type,
      text,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      replyTo: replyToId,
      readBy: [senderId],
      status: 'sent',
    });

    // Update conversation metrics
    await conversationRepository.updateLastMessage(conversationId, msg._id);
    await conversationRepository.incrementUnreadCount(conversationId, senderId);

    return msg;
  }

  /**
   * Sends a system notification message inside a conversation thread.
   */
  async sendSystemMessage(conversationId, text) {
    // System messages are created by server triggers, bypasses block checks
    const msg = await messageRepository.create({
      conversationId,
      senderId: '000000000000000000000000', // Server/System user placeholder ID
      type: 'system',
      text,
      readBy: [],
      status: 'sent',
    });

    await conversationRepository.updateLastMessage(conversationId, msg._id);
    return msg;
  }

  /**
   * Edits a message text.
   */
  async editMessage(messageId, senderId, newText) {
    const msg = await messageRepository.findById(messageId);
    if (!msg) {
      throw new NotFoundError('Message not found.');
    }

    if (String(msg.senderId._id || msg.senderId) !== String(senderId)) {
      throw new ForbiddenError('You can only edit your own messages.');
    }

    if (msg.type === 'system') {
      throw new ValidationError('System notifications cannot be modified.');
    }

    return await messageRepository.updateMessage(messageId, newText);
  }

  /**
   * Soft deletes a message.
   */
  async deleteMessage(messageId, senderId) {
    const msg = await messageRepository.findById(messageId);
    if (!msg) {
      throw new NotFoundError('Message not found.');
    }

    if (String(msg.senderId._id || msg.senderId) !== String(senderId)) {
      throw new ForbiddenError('You can only delete your own messages.');
    }

    return await messageRepository.deleteMessage(messageId);
  }

  /**
   * Resets unread counter and marks messages as read.
   */
  async markConversationRead(conversationId, userId) {
    await conversationRepository.resetUnreadCount(conversationId, userId);
    await messageRepository.markConversationMessagesAsRead(conversationId, userId);
    return { success: true };
  }

  /**
   * Blocks another user.
   */
  async blockUser(blockerId, blockedId) {
    if (String(blockerId) === String(blockedId)) {
      throw new ValidationError('You cannot block yourself.');
    }
    return await blockRepository.block(blockerId, blockedId);
  }

  /**
   * Unblocks another user.
   */
  async unblockUser(blockerId, blockedId) {
    return await blockRepository.unblock(blockerId, blockedId);
  }

  /**
   * Reports a conversation or message thread.
   */
  async reportChat(reporterId, conversationId, messageId, reason, explanation) {
    if (!reason || !explanation) {
      throw new ValidationError('Report reason and explanation are required.');
    }
    return await chatReportRepository.create({
      reporterId,
      conversationId,
      messageId: messageId || undefined,
      reason,
      explanation
    });
  }

  /**
   * Gets list of reported chats for admin moderation.
   */
  async getReportedChats() {
    return await chatReportRepository.findAll();
  }

  /**
   * Resolves a reported chat.
   */
  async resolveReport(reportId) {
    return await chatReportRepository.updateStatus(reportId, 'resolved');
  }
}

export default new ChatService();
