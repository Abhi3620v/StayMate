import express from 'express';
import propertyController from '../controllers/propertyController.js';
import { protect, checkAccess } from '../../../middlewares/authMiddleware.js';
import { checkPropertyOwnership } from '../middlewares/propertyMiddleware.js';
import { upload } from '../../../config/cloudinary.js';
import legacyPropertyController from '../../../controllers/propertyController.js';

const router = express.Router();

// Public Property Searches
router.get('/', propertyController.searchProperties);

// Prioritized authenticated user specific subroutes (to avoid matching /:id)
router.get('/user/visits', protect, legacyPropertyController.getVisits);
router.get('/user/wishlist', protect, legacyPropertyController.getWishlist);
router.post('/user/visits', protect, legacyPropertyController.requestVisit);
router.patch('/user/visits/:id', protect, legacyPropertyController.updateVisit);
router.post('/:id/wishlist', protect, legacyPropertyController.toggleWishlist);

// Moderation Queues & Admin Analytics (Gated and prioritized before /:id)
router.get('/moderation/queue', protect, checkAccess({ permissions: ['property:review'] }), propertyController.getReviewQueue);
router.get('/moderation/stats', protect, checkAccess({ permissions: ['property:review'] }), propertyController.getModerationStats);
router.get('/owner-history/:ownerId', protect, checkAccess({ permissions: ['property:review'] }), propertyController.getOwnerHistory);
router.get('/admin/analytics', protect, checkAccess({ roles: ['admin'] }), propertyController.getPlatformAnalytics);

router.get('/:id', propertyController.getProperty);

// Authenticated Endpoints
router.use(protect);

// Bulk Operations (Prioritized before :id actions)
router.post('/bulk/archive', checkAccess({ permissions: ['property:archive'] }), propertyController.bulkArchive);
router.post('/bulk/restore', checkAccess({ permissions: ['property:create'] }), propertyController.bulkRestore);
router.post('/bulk/delete', checkAccess({ permissions: ['property:delete'] }), propertyController.bulkDelete);
router.post('/bulk/submit', checkAccess({ permissions: ['property:publish'] }), propertyController.bulkSubmit);
router.post('/bulk/review', checkAccess({ permissions: ['property:review'] }), propertyController.bulkReview);

router.post(
  '/', 
  checkAccess({ permissions: ['property:create'] }), 
  propertyController.createProperty
);

// Actions gated with CheckPropertyOwnership validation
router.patch(
  '/:id', 
  checkAccess({ permissions: ['property:update'] }), 
  checkPropertyOwnership,
  propertyController.updateProperty
);

router.post(
  '/:id/publish', 
  checkAccess({ permissions: ['property:publish'] }), 
  checkPropertyOwnership,
  propertyController.publishProperty
);

router.post(
  '/:id/archive', 
  checkAccess({ permissions: ['property:archive'] }), 
  checkPropertyOwnership,
  propertyController.archiveProperty
);

router.post(
  '/:id/duplicate', 
  checkAccess({ permissions: ['property:duplicate'] }), 
  checkPropertyOwnership,
  propertyController.duplicateProperty
);

router.post(
  '/:id/upload-images',
  checkAccess({ permissions: ['property:update'] }),
  checkPropertyOwnership,
  upload.array('images', 10),
  propertyController.uploadPropertyImages
);

router.put(
  '/:id/availability',
  checkAccess({ permissions: ['property:update'] }),
  checkPropertyOwnership,
  propertyController.updateAvailability
);

router.get(
  '/:id/timeline',
  checkAccess({ permissions: ['property:view'] }),
  checkPropertyOwnership,
  propertyController.getPropertyTimeline
);

router.delete(
  '/:id',
  checkAccess({ permissions: ['property:delete'] }),
  checkPropertyOwnership,
  propertyController.softDeleteProperty
);

router.post(
  '/:id/restore',
  checkAccess({ permissions: ['property:create'] }),
  checkPropertyOwnership,
  propertyController.restoreProperty
);

// Admin-only operations
router.post(
  '/:id/review',
  checkAccess({ permissions: ['property:review'] }),
  propertyController.reviewProperty
);

router.delete(
  '/:id/permanent',
  checkAccess({ roles: ['admin'] }),
  propertyController.hardDeleteProperty
);

router.get(
  '/:id/analytics', 
  checkAccess({ permissions: ['analytics:view'] }), 
  checkPropertyOwnership,
  propertyController.getPropertyAnalytics
);

// Landlord Endpoint
router.get(
  '/owner/listings', 
  checkAccess({ permissions: ['property:view'] }), 
  propertyController.getOwnerProperties
);

export default router;
