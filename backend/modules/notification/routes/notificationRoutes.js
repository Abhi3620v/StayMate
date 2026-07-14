import express from 'express';
import { protect, checkAccess } from '../../../middlewares/authMiddleware.js';
import notificationController from '../controllers/notificationController.js';

const router = express.Router();

// General Notification Endpoints
router.get('/', protect, notificationController.getNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.get('/activity', protect, notificationController.getActivityFeed);

// Status Toggles & Management Actions
router.post('/read', protect, notificationController.markRead);
router.post('/read-all', protect, notificationController.markAllRead);
router.patch('/:id/archive', protect, notificationController.archiveNotification);
router.patch('/:id/undo-archive', protect, notificationController.undoArchiveNotification);
router.delete('/:id', protect, notificationController.deleteNotification);

// User Preferences Settings
router.get('/preferences', protect, notificationController.getPreferences);
router.put('/preferences', protect, notificationController.updatePreferences);

// Admin-only operations
router.post('/broadcast', protect, checkAccess({ roles: ['admin'] }), notificationController.broadcastAnnouncement);
router.get('/admin/analytics', protect, checkAccess({ roles: ['admin'] }), notificationController.getAnalyticsSummary);

export default router;
