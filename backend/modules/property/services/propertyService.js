import propertyRepository from '../repositories/propertyRepository.js';
import { validatePropertyInput } from '../validators/propertyValidator.js';
import propertyEventEmitter from '../../../utils/eventEmitter.js';
import { PROPERTY_EVENTS } from '../events/propertyEvents.js';
import { PROPERTY_STATUS } from '../config/propertyWorkflow.js';
import { createNewPropertyDefaults } from '../types/propertyDefaults.js';
import { generatePropertySlug } from '../utils/slugify.js';
import { logAction } from '../../../utils/auditLogger.js';
import uploadService from '../../../services/uploadService.js';
import AuditLog from '../../../models/AuditLog.js';
import mongoose from 'mongoose';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../utils/errors.js';

class PropertyService {
  // Slug helper
  resolveSlug(title, city) {
    return generatePropertySlug(title, city);
  }

  async createProperty(ownerId, data, req = null) {
    const defaults = createNewPropertyDefaults(ownerId);
    
    // Generate clean slug using Title + City
    const slug = this.resolveSlug(
      data.basicInfo?.title || data.title,
      data.location?.city
    );

    const mergedData = {
      ...defaults,
      ...data,
      slug,
      ownerId
    };

    const isDraft = mergedData.status === PROPERTY_STATUS.DRAFT;
    const validationResult = validatePropertyInput(mergedData, isDraft);
    if (!validationResult.success) {
      throw new ValidationError('Property validation failed', validationResult.error.errors);
    }

    const property = await propertyRepository.create(mergedData);
    
    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.CREATED,
        status: 'success',
        details: { propertyId: property._id, slug: property.slug },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.CREATED, property);
    return property;
  }

  async getProperty(id) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }
    await propertyRepository.incrementViews(id);
    return property;
  }

  async updateProperty(id, ownerId, data, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    // Ownership check
    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to update this property');
    }

    const updatedData = { ...data };

    // Regenerate slug if title or city changes, and the property has not been published yet
    const newTitle = data.basicInfo?.title || data.title;
    const newCity = data.location?.city;
    if (property.status === PROPERTY_STATUS.DRAFT && (newTitle || newCity)) {
      updatedData.slug = this.resolveSlug(
        newTitle || property.title,
        newCity || property.location?.city
      );
    }

    const isDraft = (data.status || property.status) === PROPERTY_STATUS.DRAFT;
    const validationResult = validatePropertyInput(updatedData, isDraft);
    if (!validationResult.success) {
      throw new ValidationError('Property validation failed', validationResult.error.errors);
    }

    const updatedProperty = await propertyRepository.findByIdAndUpdate(id, updatedData, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.UPDATED,
        status: 'success',
        details: { propertyId: id, fields: Object.keys(data) },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.UPDATED, updatedProperty);
    return updatedProperty;
  }

  async publishProperty(id, ownerId, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to publish this property');
    }

    const validationResult = validatePropertyInput(property, false);
    if (!validationResult.success) {
      throw new ValidationError('Property details incomplete for publishing', validationResult.error.errors);
    }

    const update = {
      status: PROPERTY_STATUS.PUBLISHED,
      'metadata.publishedAt': new Date(),
      'metadata.publishedBy': ownerId
    };

    const updated = await propertyRepository.findByIdAndUpdate(id, update, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.PUBLISHED,
        status: 'success',
        details: { propertyId: id },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.PUBLISHED, updated);
    return updated;
  }

  async archiveProperty(id, ownerId, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to archive this property');
    }

    const update = {
      status: PROPERTY_STATUS.ARCHIVED,
      'metadata.archivedAt': new Date(),
      'metadata.archivedBy': ownerId
    };

    const updated = await propertyRepository.findByIdAndUpdate(id, update, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.ARCHIVED,
        status: 'success',
        details: { propertyId: id },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.ARCHIVED, updated);
    return updated;
  }

  async duplicateProperty(id, ownerId, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to duplicate this property');
    }

    const duplicateTitle = `${property.basicInfo?.title || property.title} (Copy)`;
    const newSlug = this.resolveSlug(duplicateTitle, property.location?.city);

    const duplicateData = {
      title: duplicateTitle,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      location: property.location,
      pricing: property.pricing,
      roomDetails: property.roomDetails,
      amenities: property.amenities,
      images: property.images?.map(img => ({ ...img, isPrimary: false })),
      slug: newSlug,
      status: PROPERTY_STATUS.DRAFT
    };

    const newProperty = await propertyRepository.create({
      ...createNewPropertyDefaults(ownerId),
      ...duplicateData,
      ownerId
    });

    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.DUPLICATED,
        status: 'success',
        details: { originalId: id, newId: newProperty._id },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.DUPLICATED, newProperty);
    return newProperty;
  }

  // Soft delete listing
  async softDeleteProperty(id, ownerId, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to delete this property');
    }

    const deleted = await propertyRepository.softDelete(id, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.DELETED,
        status: 'success',
        details: { propertyId: id, deletionType: 'soft' },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.DELETED, deleted);
    return deleted;
  }

  // Restore soft deleted listing back to draft
  async restoreProperty(id, ownerId, req = null) {
    const property = await propertyRepository.findById(id, true); // true to find soft_deleted
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to restore this property');
    }

    const update = {
      status: PROPERTY_STATUS.DRAFT,
      'metadata.deletedAt': null,
      'metadata.deletedBy': null
    };

    const restored = await propertyRepository.findByIdAndUpdate(id, update, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: 'property:restored',
        status: 'success',
        details: { propertyId: id },
        req
      });
    }

    propertyEventEmitter.emit('property:restored', restored);
    return restored;
  }

  // Hard delete listing (Admin only)
  async hardDeleteProperty(id, adminUserId, req = null) {
    const deleted = await propertyRepository.hardDelete(id);
    if (!deleted) {
      throw new NotFoundError('Property listing not found');
    }

    if (req) {
      await logAction({
        userId: adminUserId,
        action: PROPERTY_EVENTS.DELETED,
        status: 'success',
        details: { propertyId: id, deletionType: 'hard' },
        req
      });
    }

    return deleted;
  }

  async getOwnerProperties(ownerId) {
    return await propertyRepository.find({ ownerId });
  }

  async uploadPropertyImages(id, ownerId, files, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to upload images for this property');
    }

    if (!files || files.length === 0) {
      throw new ValidationError('No files uploaded');
    }

    // Call Cloudinary/Sandbox uploader
    const fileBuffers = files.map(file => file.buffer);
    const uploadedImages = await uploadService.uploadPropertyImages(fileBuffers);

    // Map to flexible media structure
    const startOrder = property.images?.length || 0;
    const mediaEntries = uploadedImages.map((img, idx) => ({
      publicId: img.publicId,
      url: img.url,
      type: 'image',
      displayOrder: startOrder + idx,
      uploadedAt: new Date(),
      uploadedBy: ownerId,
      isPrimary: startOrder + idx === 0 // Mark first image as primary if gallery was empty
    }));

    const updatedImages = [...(property.images || []), ...mediaEntries];
    const updated = await propertyRepository.findByIdAndUpdate(id, {
      images: updatedImages
    }, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: PROPERTY_EVENTS.UPDATED,
        status: 'success',
        details: { propertyId: id, uploadedCount: files.length },
        req
      });
    }

    propertyEventEmitter.emit(PROPERTY_EVENTS.UPDATED, updated);
    return updated.images;
  }

  async searchProperties(filters = {}, options = {}) {
    return await propertyRepository.find(filters, options);
  }

  async countProperties(filters = {}) {
    return await propertyRepository.countDocuments(filters);
  }

  async updatePropertyAvailability(id, ownerId, availabilityData, req = null) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to update availability for this property');
    }

    const updated = await propertyRepository.findByIdAndUpdate(id, {
      availability: {
        availableFrom: availabilityData.availableFrom || property.availability?.availableFrom,
        minimumStay: Number(availabilityData.minimumStay || property.availability?.minimumStay || 1),
        maximumStay: Number(availabilityData.maximumStay || property.availability?.maximumStay || 12),
        availabilityStatus: availabilityData.availabilityStatus || 'available' // available, occupied, reserved
      }
    }, ownerId);

    if (req) {
      await logAction({
        userId: ownerId,
        action: 'property:availability:updated',
        status: 'success',
        details: { propertyId: id, availabilityStatus: availabilityData.availabilityStatus },
        req
      });
    }

    propertyEventEmitter.emit('property:availability:updated', updated);
    return updated;
  }

  async getPropertyTimeline(id, ownerId, userRole = '') {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    const isAdmin = ['admin', 'moderator'].includes(userRole);
    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (!isAdmin && String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to view the timeline for this property');
    }

    // Query AuditLog collection for any logs relating to this property ID
    let logs = [];
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      logs = await AuditLog.find({
        $or: [
          { 'details.propertyId': String(id) },
          { 'details.propertyId': new mongoose.Types.ObjectId(id) }
        ]
      })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email avatar role');
    }

    // Map logs to timeline shape
    return logs.map(log => ({
      id: log._id,
      action: log.action,
      timestamp: log.timestamp,
      details: log.details,
      status: log.status,
      user: log.userId ? {
        id: log.userId._id,
        name: log.userId.name,
        role: log.userId.role,
        avatar: log.userId.avatar
      } : null
    }));
  }

  async bulkArchive(ids, ownerId, req = null) {
    const results = [];
    for (const id of ids) {
      try {
        const archived = await this.archiveProperty(id, ownerId, req);
        results.push({ id, success: true, data: archived });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  async bulkRestore(ids, ownerId, req = null) {
    const results = [];
    for (const id of ids) {
      try {
        const restored = await this.restoreProperty(id, ownerId, req);
        results.push({ id, success: true, data: restored });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  async bulkDelete(ids, ownerId, req = null) {
    const results = [];
    for (const id of ids) {
      try {
        const deleted = await this.softDeleteProperty(id, ownerId, req);
        results.push({ id, success: true, data: deleted });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  async bulkSubmit(ids, ownerId, req = null) {
    const results = [];
    for (const id of ids) {
      try {
        const published = await this.publishProperty(id, ownerId, req);
        results.push({ id, success: true, data: published });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }

  async reviewPropertyListing(id, reviewerId, action, reviewData = {}, req = null) {
    const property = await propertyRepository.findById(id, true);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    let statusUpdate = {};
    let eventName = '';
    const notes = reviewData.notes || '';
    const reason = reviewData.reason || '';

    switch (action) {
      case 'approve':
        statusUpdate = {
          status: PROPERTY_STATUS.PUBLISHED,
          verification: 'verified',
          'features.verified': true,
          'metadata.publishedAt': new Date(),
          'metadata.publishedBy': reviewerId
        };
        eventName = 'property:approved';
        break;
      case 'reject':
        statusUpdate = {
          status: PROPERTY_STATUS.REJECTED,
          verification: 'rejected',
          'features.verified': false,
          'metadata.rejectedAt': new Date(),
          'metadata.rejectedBy': reviewerId
        };
        eventName = 'property:rejected';
        break;
      case 'changes_requested':
        statusUpdate = {
          status: PROPERTY_STATUS.DRAFT,
          verification: 'pending',
          'features.verified': false
        };
        eventName = 'property:changesRequested';
        break;
      case 'suspend':
        statusUpdate = {
          status: PROPERTY_STATUS.SUSPENDED,
          verification: 'suspended',
          'features.verified': false,
          'metadata.suspendedAt': new Date(),
          'metadata.suspendedBy': reviewerId
        };
        eventName = 'property:suspended';
        break;
      default:
        throw new ValidationError('Invalid review action specified');
    }

    const updated = await propertyRepository.findByIdAndUpdate(id, {
      ...statusUpdate,
      moderatorNotes: notes,
      rejectionReason: reason
    }, reviewerId);

    if (req) {
      await logAction({
        userId: reviewerId,
        action: eventName,
        status: 'success',
        details: { propertyId: id, reason, notes },
        req
      });
    }

    propertyEventEmitter.emit(eventName, { property: updated, notes, reason });
    return updated;
  }

  async getAdminReviewQueue(filters = {}, options = {}) {
    const finalFilters = { ...filters };
    // By default, the admin moderation queue filters for pending review or reported listings
    if (!finalFilters.status) {
      finalFilters.status = { $in: [PROPERTY_STATUS.PENDING_REVIEW, PROPERTY_STATUS.PUBLISHED] };
    }
    return await propertyRepository.find(finalFilters, options, true); // true to include soft deleted
  }

  async getAdminStats() {
    const total = await propertyRepository.countDocuments({}, true);
    const pending = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.PENDING_REVIEW }, true);
    const published = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.PUBLISHED }, true);
    const suspended = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.SUSPENDED }, true);
    const softDeleted = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.SOFT_DELETED }, true);
    const rejected = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.REJECTED }, true);

    const approvalRate = total > 0 ? Math.round((published / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return {
      pendingReviews: pending,
      publishedProperties: published,
      suspendedProperties: suspended,
      softDeletedProperties: softDeleted,
      approvalRate,
      rejectionRate,
      totalProperties: total
    };
  }

  async getOwnerHistory(ownerId) {
    const total = await propertyRepository.countDocuments({ ownerId }, true);
    const approved = await propertyRepository.countDocuments({ ownerId, status: PROPERTY_STATUS.PUBLISHED }, true);
    const rejected = await propertyRepository.countDocuments({ ownerId, status: PROPERTY_STATUS.REJECTED }, true);
    const suspended = await propertyRepository.countDocuments({ ownerId, status: PROPERTY_STATUS.SUSPENDED }, true);

    return {
      totalListings: total,
      approvedListings: approved,
      rejectedListings: rejected,
      suspendedListings: suspended,
      verificationStatus: approved > 0 ? 'verified' : 'pending'
    };
  }

  async bulkReview(ids, reviewerId, action, reviewData = {}, req = null) {
    const results = [];
    for (const id of ids) {
      try {
        const updated = await this.reviewPropertyListing(id, reviewerId, action, reviewData, req);
        results.push({ id, success: true, data: updated });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return results;
  }
  async getPropertyAnalytics(id, ownerId) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    // Enforce ownership
    const originalOwnerId = property.ownerId._id || property.ownerId;
    if (String(originalOwnerId) !== String(ownerId)) {
      throw new ForbiddenError('You are not authorized to view analytics for this property');
    }

    const views = property.statistics?.views || 0;
    const favorites = property.statistics?.favorites || 0;
    const visitRequests = property.statistics?.visitRequests || 0;
    const shares = property.statistics?.shares || 0;

    // Calculate listing health score (out of 100)
    let score = 20; // base score for creating property
    const suggestions = [];

    if (property.images && property.images.length >= 3) {
      score += 15;
    } else {
      suggestions.push('Upload at least 3 high-quality images of rooms/bathrooms.');
    }

    if (property.description && property.description.length >= 100) {
      score += 15;
    } else {
      suggestions.push('Improve description text (add flatmate requirements, area advantages, rules).');
    }

    if (property.amenities && Object.values(property.amenities).filter(Boolean).length >= 5) {
      score += 15;
    } else {
      suggestions.push('Check at least 5 amenities checkboxes (e.g. WiFi, Water, Parking).');
    }

    if (property.location && property.location.landmark) {
      score += 15;
    } else {
      suggestions.push('Provide a clear nearby landmark to assist tenants in navigation.');
    }

    if (property.verification === 'verified') {
      score += 20;
    } else {
      suggestions.push('Verify your listing via the platform moderation program.');
    }

    const healthScoreLabel = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Improvement';

    // Mock trend line data (last 7 days views/wishlists)
    const generateMockTrend = (baseVal, multiplier) => {
      return Array(7).fill(0).map((_, idx) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - idx));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.round(baseVal / 7 + Math.random() * multiplier)
        };
      });
    };

    return {
      propertyId: id,
      title: property.title,
      stats: {
        totalViews: views,
        wishlistSaves: favorites,
        visitRequests,
        profileShares: shares,
        conversionRate: views > 0 ? Math.round((visitRequests / views) * 100) : 0,
        avgDailyViews: Math.round(views / 14) || 1
      },
      health: {
        score,
        status: healthScoreLabel,
        suggestions
      },
      trends: {
        viewsOverTime: generateMockTrend(views, 5),
        wishlistTrend: generateMockTrend(favorites, 2),
        visitRequestTrend: generateMockTrend(visitRequests, 1)
      }
    };
  }

  async getPlatformAnalytics() {
    const total = await propertyRepository.countDocuments({}, true);
    const published = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.PUBLISHED }, true);
    const pending = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.PENDING_REVIEW }, true);
    const suspended = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.SUSPENDED }, true);
    const archived = await propertyRepository.countDocuments({ status: PROPERTY_STATUS.ARCHIVED }, true);

    // City distributions (agg or mock based on data)
    const citiesList = await propertyRepository.find({}, {}, true);
    const cityCounts = {};
    const typeCounts = {};

    citiesList.forEach(p => {
      const city = p.location?.city || 'Pune';
      cityCounts[city] = (cityCounts[city] || 0) + 1;

      const type = p.propertyType || '1BHK';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const cityDistribution = Object.entries(cityCounts).map(([name, value]) => ({ name, value }));
    const typeDistribution = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Mock top owners leaderboard
    const topOwners = [
      { name: 'Rohan Joshi', listings: 8, verified: true, active: true },
      { name: 'Sneha Patil', listings: 5, verified: true, active: true },
      { name: 'Amit Kumar', listings: 4, verified: false, active: true }
    ];

    return {
      kpi: {
        totalListings: total,
        publishedListings: published,
        pendingReviews: pending,
        suspendedListings: suspended,
        archivedListings: archived
      },
      distributions: {
        cityDistribution,
        typeDistribution
      },
      leaderboard: topOwners,
      moderation: {
        avgReviewTime: '3.4 hours',
        commonRejectionReason: 'Poor Quality Cover Images'
      }
    };
  }
}

export default new PropertyService();
