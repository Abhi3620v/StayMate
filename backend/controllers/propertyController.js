import { propertyService } from '../services/propertyService.js';
import { propertyCreateSchema } from '../validators/propertySchema.js';
import { ValidationError, ForbiddenError } from '../utils/errors.js';
import { logAction } from '../utils/auditLogger.js';

export const propertyController = {
  /**
   * Create a new property draft or published listing
   */
  createProperty: async (req, res, next) => {
    try {
      // Enforce Owner/Admin RBAC
      if (!['owner', 'admin'].includes(req.user.role)) {
        throw new ForbiddenError('Access Denied. Only Owners can create listings.');
      }

      // Allow drafts to bypass full validation if status is 'draft'
      let propertyData = req.body;
      if (req.body.status !== 'draft') {
        const validation = propertyCreateSchema.safeParse(req.body);
        if (!validation.success) {
          throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
        }
        propertyData = validation.data;
      }

      const property = await propertyService.createProperty(req.user._id, propertyData);

      await logAction({
        userId: req.user._id,
        action: 'PROPERTY_CREATE',
        status: 'success',
        details: { propertyId: property._id, status: property.status },
        req,
      });

      res.status(201).json({
        success: true,
        message: property.status === 'draft' ? 'Draft saved successfully.' : 'Listing published successfully.',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update listing details
   */
  updateProperty: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Allow drafts to skip strict validation
      let updateData = req.body;
      if (req.body.status === 'published') {
        const validation = propertyCreateSchema.safeParse(req.body);
        if (!validation.success) {
          throw new ValidationError('Validation failed', validation.error.flatten().fieldErrors);
        }
        updateData = validation.data;
      }

      const property = await propertyService.updateProperty(id, req.user._id, updateData);

      await logAction({
        userId: req.user._id,
        action: 'PROPERTY_UPDATE',
        status: 'success',
        details: { propertyId: id, status: property.status },
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Listing updated successfully.',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Soft deletes a listing (sets status to archived)
   */
  deleteProperty: async (req, res, next) => {
    try {
      const { id } = req.params;
      const property = await propertyService.deleteProperty(id, req.user._id);

      await logAction({
        userId: req.user._id,
        action: 'PROPERTY_DELETE',
        status: 'success',
        details: { propertyId: id },
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Listing archived successfully.',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Clones a listing to create a duplicate draft
   */
  duplicateProperty: async (req, res, next) => {
    try {
      const { id } = req.params;
      const property = await propertyService.duplicateProperty(id, req.user._id);

      await logAction({
        userId: req.user._id,
        action: 'PROPERTY_DUPLICATE',
        status: 'success',
        details: { propertyId: id, newPropertyId: property._id },
        req,
      });

      res.status(201).json({
        success: true,
        message: 'Listing duplicated into draft.',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch active properties feed with search queries
   */
  getProperties: async (req, res, next) => {
    try {
      const result = await propertyService.getProperties(req.query);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get specific listing by ID
   */
  getProperty: async (req, res, next) => {
    try {
      const { id } = req.params;
      const property = await propertyService.getPropertyById(id);
      res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * View owner properties listings dashboard panel
   */
  getOwnerProperties: async (req, res, next) => {
    try {
      const properties = await propertyService.getOwnerProperties(req.user._id);
      res.status(200).json({
        success: true,
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle saved status of listing
   */
  toggleWishlist: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await propertyService.toggleWishlist(req.user._id, id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * View wishlist items
   */
  getWishlist: async (req, res, next) => {
    try {
      const wishlist = await propertyService.getWishlist(req.user._id);
      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Requests a property tour visit booking (Section 9)
   */
  requestVisit: async (req, res, next) => {
    try {
      const { propertyId, date, time, note } = req.body;
      if (!propertyId || !date || !time) {
        throw new ValidationError('Property ID, Date, and Time are required.');
      }

      const visit = await propertyService.requestVisit(req.user._id, { propertyId, date, time, note });

      await logAction({
        userId: req.user._id,
        action: 'VISIT_REQUEST',
        status: 'success',
        details: { propertyId, visitId: visit._id },
        req,
      });

      res.status(201).json({
        success: true,
        message: 'Visit request submitted successfully.',
        data: visit,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * View visit booking tables (Tenant or Owner logs)
   */
  getVisits: async (req, res, next) => {
    try {
      const role = req.user.role === 'owner' ? 'owner' : 'tenant';
      const visits = await propertyService.getVisitRequests(req.user._id, role);
      res.status(200).json({
        success: true,
        data: visits,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Accept/Reject/Reschedule visit request (Section 9)
   */
  updateVisit: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, rescheduleReason } = req.body;

      if (!['accepted', 'rejected', 'rescheduled'].includes(status)) {
        throw new ValidationError('Invalid status change value.');
      }

      const visit = await propertyService.updateVisitRequest(id, req.user._id, { status, rescheduleReason });

      await logAction({
        userId: req.user._id,
        action: `VISIT_${status.toUpperCase()}`,
        status: 'success',
        details: { visitId: id },
        req,
      });

      res.status(200).json({
        success: true,
        message: `Visit request ${status} successfully.`,
        data: visit,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default propertyController;
