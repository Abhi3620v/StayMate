import express from 'express';
import reviewController from '../controllers/reviewController.js';
import { protect, checkAccess } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', reviewController.getReviews);
router.get('/stats', reviewController.getReviewStats);
router.get('/reputation/:userId', reviewController.getReputationScore);

// Authenticated routes
router.use(protect);

router.post('/', checkAccess({ permissions: ['review:create'] }), reviewController.createReview);
router.put('/:id', checkAccess({ permissions: ['review:update'] }), reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/reply', reviewController.addReply);
router.post('/:id/vote', reviewController.voteHelpful);
router.post('/:id/report', reviewController.reportReview);

// Moderation/Admin-only routes
router.get('/reports', checkAccess({ permissions: ['report:review'] }), reviewController.getReports);
router.post('/reports/:reviewId/resolve/:reportId', checkAccess({ permissions: ['report:resolve'] }), reviewController.resolveReport);

export default router;
