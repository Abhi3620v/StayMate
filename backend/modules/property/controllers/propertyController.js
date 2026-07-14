import propertyService from '../services/propertyService.js';
import { PROPERTY_STATUS } from '../config/propertyWorkflow.js';

class PropertyController {
  // POST /properties
  async createProperty(req, res, next) {
    try {
      const ownerId = req.user.id;
      const property = await propertyService.createProperty(ownerId, req.body, req);
      res.status(201).json({
        success: true,
        message: 'Property listing created successfully',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/:id
  async getProperty(req, res, next) {
    try {
      const { id } = req.params;
      const property = await propertyService.getProperty(id);
      res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /properties/:id
  async updateProperty(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.updateProperty(id, ownerId, req.body, req);
      res.status(200).json({
        success: true,
        message: 'Property listing updated successfully',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/:id/publish
  async publishProperty(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.publishProperty(id, ownerId, req);
      res.status(200).json({
        success: true,
        message: 'Property listing submitted for review and published',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/:id/archive
  async archiveProperty(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.archiveProperty(id, ownerId, req);
      res.status(200).json({
        success: true,
        message: 'Property listing archived successfully',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/:id/duplicate
  async duplicateProperty(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.duplicateProperty(id, ownerId, req);
      res.status(201).json({
        success: true,
        message: 'Property listing duplicated successfully as draft',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /properties/:id (Soft delete)
  async softDeleteProperty(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.softDeleteProperty(id, ownerId, req);
      res.status(200).json({
        success: true,
        message: 'Property listing deleted successfully (soft deleted)',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/:id/restore
  async restoreProperty(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.restoreProperty(id, ownerId, req);
      res.status(200).json({
        success: true,
        message: 'Property listing restored successfully as draft',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /properties/:id/permanent (Admin only hard delete)
  async hardDeleteProperty(req, res, next) {
    try {
      const { id } = req.params;
      const adminUserId = req.user.id;
      await propertyService.hardDeleteProperty(id, adminUserId, req);
      res.status(200).json({
        success: true,
        message: 'Property listing permanently deleted from the database'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /owner/properties
  async getOwnerProperties(req, res, next) {
    try {
      const ownerId = req.user.id;
      const properties = await propertyService.getOwnerProperties(ownerId);
      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties
  async searchProperties(req, res, next) {
    try {
      const filters = {};
      const options = {
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0
      };

      if (req.query.city) filters['location.city'] = req.query.city;
      if (req.query.propertyType) filters.propertyType = req.query.propertyType;
      if (req.query.listingType) filters.listingType = req.query.listingType;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.lat) filters.lat = req.query.lat;
      if (req.query.lng) filters.lng = req.query.lng;
      if (req.query.radius) filters.radius = req.query.radius;

      const properties = await propertyService.searchProperties(filters, options);
      const total = await propertyService.countProperties(filters);

      res.status(200).json({
        success: true,
        data: properties,
        pagination: {
          total,
          limit: options.limit,
          skip: options.skip
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/:id/analytics
  async getPropertyAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const analytics = await propertyService.getPropertyAnalytics(id, ownerId);
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/admin/analytics
  async getPlatformAnalytics(req, res, next) {
    try {
      const analytics = await propertyService.getPlatformAnalytics();
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/:id/upload-images
  async uploadPropertyImages(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const images = await propertyService.uploadPropertyImages(id, ownerId, req.files, req);
      res.status(200).json({
        success: true,
        message: 'Images uploaded and saved successfully',
        data: images
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /properties/:id/availability
  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const property = await propertyService.updatePropertyAvailability(id, ownerId, req.body, req);
      res.status(200).json({
        success: true,
        message: 'Property availability updated successfully',
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/:id/timeline
  async getPropertyTimeline(req, res, next) {
    try {
      const { id } = req.params;
      const ownerId = req.user.id;
      const userRole = req.user.role;
      const logs = await propertyService.getPropertyTimeline(id, ownerId, userRole);
      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/bulk/archive
  async bulkArchive(req, res, next) {
    try {
      const { ids } = req.body;
      const ownerId = req.user.id;
      const results = await propertyService.bulkArchive(ids, ownerId, req);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/bulk/restore
  async bulkRestore(req, res, next) {
    try {
      const { ids } = req.body;
      const ownerId = req.user.id;
      const results = await propertyService.bulkRestore(ids, ownerId, req);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/bulk/delete
  async bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      const ownerId = req.user.id;
      const results = await propertyService.bulkDelete(ids, ownerId, req);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/bulk/submit
  async bulkSubmit(req, res, next) {
    try {
      const { ids } = req.body;
      const ownerId = req.user.id;
      const results = await propertyService.bulkSubmit(ids, ownerId, req);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/:id/review
  async reviewProperty(req, res, next) {
    try {
      const { id } = req.params;
      const { action, reason, notes } = req.body;
      const reviewerId = req.user.id;

      const property = await propertyService.reviewPropertyListing(id, reviewerId, action, { reason, notes }, req);
      res.status(200).json({
        success: true,
        message: `Property listing ${action}ed successfully`,
        data: property
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/moderation/queue
  async getReviewQueue(req, res, next) {
    try {
      const filters = {};
      const options = {
        limit: parseInt(req.query.limit) || 20,
        skip: parseInt(req.query.skip) || 0
      };

      if (req.query.city) filters['location.city'] = req.query.city;
      if (req.query.propertyType) filters.propertyType = req.query.propertyType;
      if (req.query.status) filters.status = req.query.status;

      const queue = await propertyService.getAdminReviewQueue(filters, options);
      res.status(200).json({
        success: true,
        data: queue
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/moderation/stats
  async getModerationStats(req, res, next) {
    try {
      const stats = await propertyService.getAdminStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /properties/owner-history/:ownerId
  async getOwnerHistory(req, res, next) {
    try {
      const { ownerId } = req.params;
      const history = await propertyService.getOwnerHistory(ownerId);
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /properties/bulk/review
  async bulkReview(req, res, next) {
    try {
      const { ids, action, reason, notes } = req.body;
      const reviewerId = req.user.id;
      const results = await propertyService.bulkReview(ids, reviewerId, action, { reason, notes }, req);
      res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PropertyController();
