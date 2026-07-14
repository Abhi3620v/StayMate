import roommateService from '../services/roommateService.js';
import matchService from '../services/matchService.js';
import requestService from '../services/requestService.js';
import {
  roommateProfileSchema,
  requestCreateSchema,
  reportCreateSchema,
  resolveReportSchema,
} from '../validators/roommateValidator.js';
import { ValidationError, ForbiddenError } from '../../../utils/errors.js';
import { logAction } from '../../../utils/auditLogger.js';

export const roommateController = {
  /**
   * Get logged-in user's roommate profile.
   */
  getMyProfile: async (req, res, next) => {
    try {
      const profile = await roommateService.getProfileByUserId(req.user._id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create roommate profile.
   */
  createProfile: async (req, res, next) => {
    try {
      if (req.user.role !== 'tenant' && req.user.role !== 'admin') {
        throw new ForbiddenError('Only Tenants can create roommate profiles.');
      }

      const validation = roommateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const profile = await roommateService.createProfile(req.user._id, validation.data);

      res.status(201).json({
        success: true,
        message: 'Roommate profile created successfully.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update roommate profile.
   */
  updateProfile: async (req, res, next) => {
    try {
      const validation = roommateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const profile = await roommateService.updateProfile(req.user._id, validation.data);

      res.status(200).json({
        success: true,
        message: 'Roommate profile updated successfully.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete roommate profile.
   */
  deleteProfile: async (req, res, next) => {
    try {
      await roommateService.deleteProfile(req.user._id);

      await logAction({
        userId: req.user._id,
        action: 'ROOMMATE_PROFILE_DELETE',
        status: 'success',
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Roommate profile deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get roommate profile by ID.
   */
  getProfileById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const profile = await roommateService.getProfileById(id, req.user?._id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Discover matching roommates with scores, filters, and sort options.
   */
  discoverMatches: async (req, res, next) => {
    try {
      const {
        gender,
        occupation,
        city,
        maxRent,
        smoking,
        drinking,
        pets,
        foodPreference,
        language,
        minCompatibility,
        maxCompatibility,
        sort,
        page,
        limit,
      } = req.query;

      const filters = {
        gender,
        occupation,
        city,
        maxRent,
        smoking,
        drinking,
        pets,
        foodPreference,
        language,
        minCompatibility,
        maxCompatibility,
      };

      const options = {
        sort: sort || 'compatibility',
        page: Number(page) || 1,
        limit: Number(limit) || 12,
      };

      const results = await matchService.discoverMatches(req.user._id, filters, options);

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send roommate connection request.
   */
  sendRequest: async (req, res, next) => {
    try {
      const validation = requestCreateSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const { receiverId, message } = validation.data;
      const request = await requestService.sendRequest(req.user._id, receiverId, message);

      // Socket Notification Alert
      if (req.io) {
        req.io.to(`user_${receiverId}`).emit('notification', {
          type: 'REQUEST_RECEIVED',
          text: `You received a new roommate request from ${req.user.name}`,
          requestId: request._id,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Roommate request sent successfully.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Accept roommate request.
   */
  acceptRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await requestService.acceptRequest(id, req.user._id);

      const targetSenderId = request.senderId._id || request.senderId;

      // Socket notification
      if (req.io) {
        req.io.to(`user_${targetSenderId}`).emit('notification', {
          type: 'REQUEST_ACCEPTED',
          text: `${req.user.name} accepted your roommate request!`,
          requestId: request._id,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Roommate request accepted.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reject roommate request.
   */
  rejectRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await requestService.rejectRequest(id, req.user._id);

      const targetSenderId = request.senderId._id || request.senderId;

      // Socket notification
      if (req.io) {
        req.io.to(`user_${targetSenderId}`).emit('notification', {
          type: 'REQUEST_REJECTED',
          text: `${req.user.name} rejected your roommate request.`,
          requestId: request._id,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Roommate request rejected.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel sent request.
   */
  cancelRequest: async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await requestService.cancelRequest(id, req.user._id);

      res.status(200).json({
        success: true,
        message: 'Roommate request cancelled successfully.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch user dashboard statistics and lists.
   */
  getMatchesDashboard: async (req, res, next) => {
    try {
      const dashboard = await requestService.getMatchesDashboard(req.user._id);
      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove active connection.
   */
  removeMatch: async (req, res, next) => {
    try {
      const { id } = req.params;
      const request = await requestService.removeMatch(id, req.user._id);

      res.status(200).json({
        success: true,
        message: 'Match connection removed.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle save/favorite roommate profile.
   */
  toggleFavorite: async (req, res, next) => {
    try {
      const { id } = req.params; // roommate profile ID
      const result = await roommateService.toggleFavorite(req.user._id, id);

      res.status(200).json({
        success: true,
        message: result.isFavorite ? 'Roommate profile saved.' : 'Roommate profile removed from saved list.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's favorites.
   */
  getFavorites: async (req, res, next) => {
    try {
      const favorites = await roommateService.getFavorites(req.user._id);
      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent views list.
   */
  getRecentViews: async (req, res, next) => {
    try {
      const views = await roommateService.getRecentViews(req.user._id);
      res.status(200).json({
        success: true,
        data: views,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Report profile.
   */
  reportProfile: async (req, res, next) => {
    try {
      const validation = reportCreateSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const report = await roommateService.reportProfile(req.user._id, validation.data);

      res.status(201).json({
        success: true,
        message: 'Roommate profile reported. Thank you for keeping our platform safe.',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin: List reports.
   */
  getReports: async (req, res, next) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        throw new ForbiddenError('Access Denied. Admins and Moderators only.');
      }

      const reports = await roommateService.getReports();
      res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin: Resolve a report.
   */
  resolveReport: async (req, res, next) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
        throw new ForbiddenError('Access Denied. Admins and Moderators only.');
      }

      const { id } = req.params;
      const validation = resolveReportSchema.safeParse(req.body);
      if (!validation.success) {
        throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
      }

      const report = await roommateService.resolveReport(id, req.user._id, validation.data);

      res.status(200).json({
        success: true,
        message: 'Report resolved successfully.',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default roommateController;
