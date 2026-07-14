import express from 'express';
import { propertyController } from '../controllers/propertyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public property feed
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getProperty);

// Authenticated wishlist & scheduling routes
router.get('/user/wishlist', protect, propertyController.getWishlist);
router.post('/:id/wishlist', protect, propertyController.toggleWishlist);

// Visit Request scheduling
router.get('/user/visits', protect, propertyController.getVisits);
router.post('/user/visits', protect, propertyController.requestVisit);
router.patch('/user/visits/:id', protect, propertyController.updateVisit);

// Owner listing control routes
router.get('/owner/listings', protect, propertyController.getOwnerProperties);
router.post('/', protect, propertyController.createProperty);
router.put('/:id', protect, propertyController.updateProperty);
router.delete('/:id', protect, propertyController.deleteProperty);
router.post('/:id/duplicate', protect, propertyController.duplicateProperty);

export default router;
