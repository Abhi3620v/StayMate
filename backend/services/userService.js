import User from '../models/User.js';
import { isDbConnected, mockUsers } from '../config/inMemoryDb.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * Service managing user profiles and preferences configuration
 */
export const userService = {
  /**
   * Updates user metadata, preferences, and details
   */
  updateProfile: async ({ userId, updateData }) => {
    let user;
    if (isDbConnected()) {
      user = await User.findById(userId);
    } else {
      user = mockUsers.find((u) => u._id === userId || u._id.toString() === userId);
    }

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Filter incoming updates
    const { name, username, phone, bio, avatar, preferences } = updateData;

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    if (preferences !== undefined) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    if (isDbConnected()) {
      await user.save();
    }

    return user;
  },

  /**
   * Performs a GDPR-compliant soft-deletion of a user account
   */
  deleteAccount: async (userId) => {
    let user;
    if (isDbConnected()) {
      user = await User.findById(userId);
    } else {
      user = mockUsers.find((u) => u._id === userId || u._id.toString() === userId);
    }

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Soft delete: scramble private data and update status
    user.status = 'deleted';
    user.name = 'Deleted Account';
    user.username = `deleted_${userId.toString().slice(-6)}`;
    user.email = `deleted_${userId.toString()}@deleted.staymate.com`;
    user.phone = undefined;
    user.bio = undefined;
    user.avatar = '';
    user.googleId = undefined;
    user.customPermissions = [];
    user.authVersion += 1; // Terminate active sessions

    if (isDbConnected()) {
      await user.save();
    }

    return true;
  }
};

export default userService;
