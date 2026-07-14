import notificationRepository from '../repositories/notificationRepository.js';
import notificationService from '../services/notificationService.js';
import { updatePreferencesSchema, broadcastAnnouncementSchema } from '../validators/notificationValidator.js';
import { ValidationError, ForbiddenError } from '../../../utils/errors.js';

export const notificationController = {
  /**
   * Fetch paginated notifications for current user
   */
  getNotifications: async (req, res, next) => {
    try {
      const recipientId = req.user._id;
      const { readStatus, category, priority, page = 1, limit = 20 } = req.query;

      const query = { recipientId, softDeleted: false };
      
      // Default to unarchived notifications
      query.archivedStatus = false;

      if (readStatus !== undefined && readStatus !== 'all') {
        query.readStatus = readStatus === 'true';
      }
      if (category) {
        query.category = category;
      }
      if (priority) {
        query.priority = priority;
      }

      const data = await notificationRepository.find(query, { page, limit });

      res.status(200).json({
        success: true,
        data: data.items,
        pagination: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: Math.ceil(data.total / data.limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch unread notifications count
   */
  getUnreadCount: async (req, res, next) => {
    try {
      const recipientId = req.user._id;
      const query = { recipientId, readStatus: false, archivedStatus: false, softDeleted: false };
      const data = await notificationRepository.find(query, { limit: 1 });

      res.status(200).json({
        success: true,
        data: { unreadCount: data.total }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch chronological unified activity logs
   */
  getActivityFeed: async (req, res, next) => {
    try {
      const recipientId = req.user._id;
      const { category, page = 1, limit = 30 } = req.query;

      // Activity timeline shows both read/unread/archived but active notifications
      const query = { recipientId, softDeleted: false };
      
      if (category) {
        query.category = category;
      }

      const data = await notificationRepository.find(query, { page, limit });

      res.status(200).json({
        success: true,
        data: data.items,
        pagination: {
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: Math.ceil(data.total / data.limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Mark selected notifications as read
   */
  markRead: async (req, res, next) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new ValidationError('An array of notification IDs is required.');
      }

      const result = await notificationRepository.updateMany(
        { _id: { $in: ids }, recipientId: req.user._id },
        { readStatus: true }
      );

      res.status(200).json({
        success: true,
        message: 'Notifications marked as read.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async (req, res, next) => {
    try {
      const result = await notificationRepository.updateMany(
        { recipientId: req.user._id, readStatus: false },
        { readStatus: true }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Archive specific notification
   */
  archiveNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notif = await notificationRepository.findById(id);
      if (!notif) {
        throw new ValidationError('Notification not found.');
      }
      if (String(notif.recipientId) !== String(req.user._id)) {
        throw new ForbiddenError('Access Denied. You do not own this notification.');
      }

      const updated = await notificationRepository.update(id, { archivedStatus: true });

      res.status(200).json({
        success: true,
        message: 'Notification archived successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Undo archive notification
   */
  undoArchiveNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notif = await notificationRepository.findById(id);
      if (!notif) {
        throw new ValidationError('Notification not found.');
      }
      if (String(notif.recipientId) !== String(req.user._id)) {
        throw new ForbiddenError('Access Denied. You do not own this notification.');
      }

      const updated = await notificationRepository.update(id, { archivedStatus: false });

      res.status(200).json({
        success: true,
        message: 'Archive undone successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Soft-delete specific notification
   */
  deleteNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notif = await notificationRepository.findById(id);
      if (!notif) {
        throw new ValidationError('Notification not found.');
      }
      if (String(notif.recipientId) !== String(req.user._id)) {
        throw new ForbiddenError('Access Denied. You do not own this notification.');
      }

      const updated = await notificationRepository.update(id, { softDeleted: true });

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Retrieve notification preferences settings
   */
  getPreferences: async (req, res, next) => {
    try {
      const data = await notificationRepository.getPreferences(req.user._id);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update user preferences settings
   */
  updatePreferences: async (req, res, next) => {
    try {
      const parsed = updatePreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request payload', parsed.error.flatten().fieldErrors);
      }

      const data = await notificationRepository.updatePreferences(req.user._id, parsed.data);
      
      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully.',
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin-only broadcast announcement
   */
  broadcastAnnouncement: async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Access Denied. Only admins may broadcast announcements.');
      }

      const parsed = broadcastAnnouncementSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid broadcast format', parsed.error.flatten().fieldErrors);
      }

      const result = await notificationService.broadcastAnnouncement(parsed.data);

      res.status(200).json({
        success: true,
        message: 'Announcement broadcasted successfully to active users.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin-only analytics summary
   */
  getAnalyticsSummary: async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Access Denied. Only admins may view analytics.');
      }

      const data = await notificationService.getAnalyticsSummary();

      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
};

export default notificationController;
