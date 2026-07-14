import propertyRepository from '../repositories/propertyRepository.js';
import { NotFoundError, ForbiddenError } from '../../../utils/errors.js';

/**
 * Reusable express middleware to verify property listing ownership.
 * Admins are automatically bypassed.
 */
export const checkPropertyOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Property ID param is required for ownership verification'
      });
    }

    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property listing not found');
    }

    // Bypass check for admin role
    if (req.user && req.user.role === 'admin') {
      req.property = property;
      return next();
    }

    const ownerId = property.ownerId._id || property.ownerId;
    if (String(ownerId) !== String(req.user.id)) {
      throw new ForbiddenError('You do not have permission to modify this property listing');
    }

    // Attach property to request to avoid querying again in controller
    req.property = property;
    next();
  } catch (error) {
    next(error);
  }
};

export default checkPropertyOwnership;
