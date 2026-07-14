import express from 'express';
import chatController from '../controllers/chatController.js';
import { protect, checkAccess } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// All chat features require user session authentication
router.use(protect);

// Admin Moderation Queue (Roles: admin, moderator)
router.get('/reports', checkAccess({ roles: ['admin', 'moderator'] }), chatController.getReports);
router.post('/reports/:id/resolve', checkAccess({ roles: ['admin', 'moderator'] }), chatController.resolveReport);

// Block User Operations
router.post('/block/:userId', chatController.blockUser);
router.delete('/block/:userId', chatController.unblockUser);

// Submit Report
router.post('/report', chatController.reportChat);

// Conversation Management
router.post('/conversations', chatController.createConversation);
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.post('/conversations/:id/read', chatController.markRead);

// Individual Message Modifications
router.put('/messages/:id', chatController.editMessage);
router.delete('/messages/:id', chatController.deleteMessage);

export default router;
