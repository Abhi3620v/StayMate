import mongoose from 'mongoose';
import { isDbConnected, mockUsers, mockProperties, mockVisitRequests } from '../../../config/inMemoryDb.js';
import { mockReviews } from '../../review/repositories/reviewRepository.js';
import { mockRoommates } from '../../roommate/repositories/roommateMockDb.js';
import { mockNotifications } from '../../notification/repositories/notificationRepository.js';
import { mockAuditLogs } from '../../../utils/auditLogger.js';

export const searchService = {
  /**
   * Search multiple entities in parallel using regex matching or mock collections
   */
  globalSearch: async (queryText, filters = {}) => {
    const q = queryText ? queryText.trim() : '';
    if (!q) {
      return {
        properties: [],
        users: [],
        roommates: [],
        reviews: [],
        visitRequests: [],
        notifications: [],
        auditLogs: []
      };
    }

    const limit = Number(filters.limit || 10);
    const category = filters.category || 'all'; // 'all', 'properties', 'users', 'roommates', etc.
    const regex = new RegExp(q, 'i');

    if (isDbConnected()) {
      const searchTasks = {};

      if (category === 'all' || category === 'properties') {
        searchTasks.properties = mongoose.models.Property.find({
          $or: [{ title: regex }, { description: regex }, { 'location.city': regex }]
        }).limit(limit).lean();
      }

      if (category === 'all' || category === 'users') {
        searchTasks.users = mongoose.models.User.find({
          $or: [{ name: regex }, { email: regex }]
        }).limit(limit).select('name email role avatar').lean();
      }

      if (category === 'all' || category === 'roommates') {
        searchTasks.roommates = mongoose.models.Roommate.find({
          $or: [{ bio: regex }, { hobbies: regex }, { 'preferences.cleanliness': regex }]
        }).limit(limit).lean();
      }

      if (category === 'all' || category === 'reviews') {
        searchTasks.reviews = mongoose.models.Review.find({
          content: regex
        }).limit(limit).lean();
      }

      if (category === 'all' || category === 'visitRequests') {
        searchTasks.visitRequests = mongoose.models.VisitRequest.find({
          $or: [{ status: regex }, { rescheduleReason: regex }]
        }).limit(limit).lean();
      }

      if (category === 'all' || category === 'notifications') {
        searchTasks.notifications = mongoose.models.Notification.find({
          $or: [{ title: regex }, { message: regex }]
        }).limit(limit).lean();
      }

      if (category === 'all' || category === 'auditLogs') {
        searchTasks.auditLogs = mongoose.models.AuditLog.find({
          $or: [{ action: regex }, { ip: regex }, { browser: regex }]
        }).limit(limit).lean();
      }

      const results = {};
      const keys = Object.keys(searchTasks);
      const values = await Promise.all(Object.values(searchTasks));
      
      keys.forEach((key, idx) => {
        results[key] = values[idx];
      });

      return {
        properties: results.properties || [],
        users: results.users || [],
        roommates: results.roommates || [],
        reviews: results.reviews || [],
        visitRequests: results.visitRequests || [],
        notifications: results.notifications || [],
        auditLogs: results.auditLogs || []
      };
    } else {
      // Mock search implementation
      const filterMock = (arr, fields) => {
        return (arr || []).filter(item => {
          return fields.some(f => {
            const val = f.split('.').reduce((obj, key) => obj?.[key], item);
            return val && String(val).toLowerCase().includes(q.toLowerCase());
          });
        }).slice(0, limit);
      };

      return {
        properties: (category === 'all' || category === 'properties') ? filterMock(mockProperties, ['title', 'description', 'location.city']) : [],
        users: (category === 'all' || category === 'users') ? filterMock(mockUsers, ['name', 'email']) : [],
        roommates: (category === 'all' || category === 'roommates') ? filterMock(mockRoommates, ['bio', 'hobbies']) : [],
        reviews: (category === 'all' || category === 'reviews') ? filterMock(mockReviews, ['content']) : [],
        visitRequests: (category === 'all' || category === 'visitRequests') ? filterMock(mockVisitRequests, ['status', 'rescheduleReason']) : [],
        notifications: (category === 'all' || category === 'notifications') ? filterMock(mockNotifications, ['title', 'message']) : [],
        auditLogs: (category === 'all' || category === 'auditLogs') ? filterMock(mockAuditLogs, ['action', 'ip', 'browser']) : []
      };
    }
  }
};

export default searchService;
