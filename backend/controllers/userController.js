import userService from '../services/userService.js';
import { updateProfileSchema } from '../validators/authSchema.js';
import { ValidationError } from '../utils/errors.js';
import { calculateCompleteness } from '../utils/profileCompleteness.js';

/**
 * Controller managing User profile settings
 */
export const userController = {
  /**
   * Updates user metadata, preferences, and details
   */
  updateProfile: async (req, res, next) => {
    try {
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError('Validation failed', validationResult.error.flatten().fieldErrors);
      }

      const updatedUser = await userService.updateProfile({
        userId: req.user._id,
        updateData: validationResult.data,
      });

      // Compute profile completeness scoring
      const completeness = calculateCompleteness(updatedUser);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            status: updatedUser.status,
            customPermissions: updatedUser.customPermissions,
            username: updatedUser.username || '',
            phone: updatedUser.phone || '',
            bio: updatedUser.bio || '',
            preferences: updatedUser.preferences || { theme: 'light', language: 'en' },
          },
          completeness,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Soft deletes user account and triggers event
   */
  deleteAccount: async (req, res, next) => {
    try {
      const user = req.user;
      await userService.deleteAccount(user._id);

      // Invalidate active session cookie on deletion
      res.clearCookie('token');

      // Import dynamic emitter to prevent circular dependency imports
      const { default: authEventEmitter } = await import('../utils/eventEmitter.js');
      authEventEmitter.emit('account:deleted', { user, req });

      res.status(200).json({
        success: true,
        message: 'Your account has been deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
};

export default userController;
