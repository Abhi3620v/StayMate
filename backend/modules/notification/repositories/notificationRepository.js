import mongoose from 'mongoose';
import Notification from '../../../models/Notification.js';
import NotificationPreference from '../../../models/NotificationPreference.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

// In-Memory Fallbacks for Testing/Offline Mode
export const mockNotifications = [];
export const mockPreferences = [];

export const notificationRepository = {
  /**
   * Create a notification record
   */
  create: async (data) => {
    if (isDbConnected()) {
      const notif = await Notification.create(data);
      return await Notification.findById(notif._id).populate('actorId', 'name email avatar');
    } else {
      const newNotif = {
        _id: 'notif-' + Math.random().toString(36).substr(2, 9),
        ...data,
        readStatus: data.readStatus ?? false,
        archivedStatus: data.archivedStatus ?? false,
        softDeleted: data.softDeleted ?? false,
        metadata: data.metadata ?? {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockNotifications.push(newNotif);
      return newNotif;
    }
  },

  /**
   * Find notification by ID
   */
  findById: async (id) => {
    if (isDbConnected()) {
      return await Notification.findById(id).populate('actorId', 'name email avatar');
    } else {
      return mockNotifications.find(n => String(n._id) === String(id)) || null;
    }
  },

  /**
   * Find notifications with options
   */
  find: async (query = {}, options = {}) => {
    const page = Number(options.page || 1);
    const limit = Number(options.limit || 20);
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const count = await Notification.countDocuments(query);
      const items = await Notification.find(query)
        .populate('actorId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return { items, total: count, page, limit };
    } else {
      // Local filter for mock array
      let filtered = mockNotifications.filter(n => {
        for (const [key, val] of Object.entries(query)) {
          if (val && typeof val === 'object' && !(val instanceof mongoose.Types.ObjectId)) {
            if ('$ne' in val) {
              if (String(n[key]) === String(val.$ne)) return false;
            } else if ('$in' in val) {
              if (!val.$in.map(String).includes(String(n[key]))) return false;
            } else if ('$gte' in val) {
              if (new Date(n[key]) < new Date(val.$gte)) return false;
            } else if ('$gt' in val) {
              if (new Date(n[key]) <= new Date(val.$gt)) return false;
            } else if ('$lte' in val) {
              if (new Date(n[key]) > new Date(val.$lte)) return false;
            } else if ('$lt' in val) {
              if (new Date(n[key]) >= new Date(val.$lt)) return false;
            }
          } else {
            if (String(n[key]) !== String(val)) return false;
          }
        }
        return true;
      });

      // Sort by newest
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      const total = filtered.length;
      const items = filtered.slice(skip, skip + limit);

      return { items, total, page, limit };
    }
  },

  /**
   * Update notification by ID
   */
  update: async (id, updateData) => {
    if (isDbConnected()) {
      return await Notification.findByIdAndUpdate(id, updateData, { new: true })
        .populate('actorId', 'name email avatar');
    } else {
      const idx = mockNotifications.findIndex(n => String(n._id) === String(id));
      if (idx !== -1) {
        mockNotifications[idx] = {
          ...mockNotifications[idx],
          ...updateData,
          updatedAt: new Date()
        };
        return mockNotifications[idx];
      }
      return null;
    }
  },

  /**
   * Update multiple notifications
   */
  updateMany: async (query, updateData) => {
    if (isDbConnected()) {
      return await Notification.updateMany(query, updateData);
    } else {
      let count = 0;
      mockNotifications.forEach((n, idx) => {
        let match = true;
        for (const [key, val] of Object.entries(query)) {
          if (val && typeof val === 'object') {
            if ('$in' in val) {
              if (!val.$in.map(String).includes(String(n[key]))) match = false;
            }
          } else {
            if (String(n[key]) !== String(val)) match = false;
          }
        }
        if (match) {
          mockNotifications[idx] = {
            ...n,
            ...updateData,
            updatedAt: new Date()
          };
          count++;
        }
      });
      return { modifiedCount: count };
    }
  },

  /**
   * Get user preferences (or create defaults)
   */
  getPreferences: async (userId) => {
    if (isDbConnected()) {
      let pref = await NotificationPreference.findOne({ userId });
      if (!pref) {
        pref = await NotificationPreference.create({ userId });
      }
      return pref;
    } else {
      let pref = mockPreferences.find(p => String(p.userId) === String(userId));
      if (!pref) {
        pref = {
          _id: 'pref-' + Math.random().toString(36).substr(2, 9),
          userId: String(userId),
          categories: {
            property: { inApp: true, email: true, push: false },
            roommate: { inApp: true, email: true, push: false },
            visit: { inApp: true, email: true, push: false },
            chat: { inApp: true, email: true, push: false },
            review: { inApp: true, email: true, push: false },
            security: { inApp: true, email: true, push: false },
            announcements: { inApp: true, email: true, push: false },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockPreferences.push(pref);
      }
      return pref;
    }
  },

  /**
   * Save user preferences
   */
  updatePreferences: async (userId, updateData) => {
    if (isDbConnected()) {
      return await NotificationPreference.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
      );
    } else {
      let pref = mockPreferences.find(p => String(p.userId) === String(userId));
      if (!pref) {
        pref = {
          _id: 'pref-' + Math.random().toString(36).substr(2, 9),
          userId: String(userId),
          categories: {},
          createdAt: new Date(),
        };
        mockPreferences.push(pref);
      }
      pref.categories = {
        ...pref.categories,
        ...updateData.categories
      };
      pref.updatedAt = new Date();
      return pref;
    }
  }
};

export default notificationRepository;
