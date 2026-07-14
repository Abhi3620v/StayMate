import chatService from '../services/chatService.js';
import { ValidationError, ForbiddenError } from '../../../utils/errors.js';
import { z } from 'zod';

// Input Zod Validation schemas
const createConversationSchema = z.object({
  type: z.enum(['property', 'roommate', 'visit']),
  contextId: z.string(),
  contextRef: z.enum(['Property', 'RoommateProfile', 'VisitRequest', 'User']),
  participantIds: z.array(z.string()).min(1),
});

const sendMessageSchema = z.object({
  text: z.string().optional(),
  attachment: z.object({
    url: z.string(),
    name: z.string(),
    size: z.number(),
  }).nullable().optional(),
  replyToId: z.string().nullable().optional(),
});

const editMessageSchema = z.object({
  text: z.string().min(1, 'Message text cannot be empty'),
});

const reportChatSchema = z.object({
  messageId: z.string().optional(),
  reason: z.enum(['spam', 'harassment', 'abuse', 'scam', 'other']),
  explanation: z.string().min(5, 'Please provide a clear explanation'),
});

class ChatController {
  createConversation = async (req, res, next) => {
    try {
      const validation = createConversationSchema.safeParse(req.body);
      if (!validation.success) {
        console.log('ZOD VALIDATION FAILED on POST /conversations:', JSON.stringify(validation.error.flatten().fieldErrors, null, 2));
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const { type, contextId, contextRef, participantIds } = validation.data;
      
      // Ensure current user is in participants list copy
      const pIds = [...participantIds];
      const uid = String(req.user._id);
      if (!pIds.includes(uid)) {
        pIds.push(uid);
      }

      const conversation = await chatService.getOrCreateConversation(type, contextId, contextRef, pIds);
      
      // Emit chat.created event to other participants
      if (req.io) {
        pIds.forEach(pid => {
          if (pid !== uid) {
            req.io.to(`user_${pid}`).emit('conversation_created', conversation);
          }
        });
      }

      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  };

  getConversations = async (req, res, next) => {
    try {
      const conversations = await chatService.getConversationsForUser(req.user._id);
      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { limit, beforeTimestamp } = req.query;

      const messages = await chatService.getMessagesForConversation(id, req.user._id, {
        limit: limit ? Number(limit) : 50,
        beforeTimestamp,
      });

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const { text, attachment, replyToId } = validation.data;
      if (!text && !attachment) {
        throw new ValidationError('Message must contain either text or an attachment.');
      }

      const message = await chatService.sendMessage(id, req.user._id, text, attachment, replyToId);

      // Emit real-time Socket updates to conversation room members
      if (req.io) {
        req.io.to(`conversation_${id}`).emit('message_received', message);
      }

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  editMessage = async (req, res, next) => {
    try {
      const { id } = req.params; // messageId
      const validation = editMessageSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const { text } = validation.data;
      const message = await chatService.editMessage(id, req.user._id, text);

      if (req.io) {
        req.io.to(`conversation_${message.conversationId}`).emit('message_edited', {
          messageId: id,
          text: message.text,
          conversationId: message.conversationId,
        });
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.params; // messageId
      const message = await chatService.deleteMessage(id, req.user._id);

      if (req.io) {
        req.io.to(`conversation_${message.conversationId}`).emit('message_deleted', {
          messageId: id,
          conversationId: message.conversationId,
        });
      }

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req, res, next) => {
    try {
      const { id } = req.params; // conversationId
      await chatService.markConversationRead(id, req.user._id);

      if (req.io) {
        req.io.to(`conversation_${id}`).emit('read_receipt', {
          conversationId: id,
          readerId: req.user._id,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conversation messages marked as read.',
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req, res, next) => {
    try {
      const { userId } = req.params; // target user to block
      await chatService.blockUser(req.user._id, userId);

      if (req.io) {
        req.io.to(`user_${userId}`).emit('user_blocked', { blockerId: req.user._id });
      }

      res.status(200).json({
        success: true,
        message: 'User blocked successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      await chatService.unblockUser(req.user._id, userId);

      res.status(200).json({
        success: true,
        message: 'User unblocked successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  reportChat = async (req, res, next) => {
    try {
      const validation = reportChatSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const { conversationId, messageId, reason, explanation } = req.body;
      if (!conversationId) {
        throw new ValidationError('Conversation ID is required to file a report.');
      }

      const report = await chatService.reportChat(
        req.user._id,
        conversationId,
        messageId,
        reason,
        explanation
      );

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully for admin review.',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin Moderation API
  getReports = async (req, res, next) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        throw new ForbiddenError('Access Denied. Admins and Moderators only.');
      }

      const reports = await chatService.getReportedChats();
      res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  };

  resolveReport = async (req, res, next) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        throw new ForbiddenError('Access Denied. Admins and Moderators only.');
      }

      const { id } = req.params; // reportId
      await chatService.resolveReport(id);

      res.status(200).json({
        success: true,
        message: 'Report resolved successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ChatController();
