import reviewService from '../services/reviewService.js';
import reputationService from '../services/reputationService.js';
import { 
  createReviewSchema, 
  updateReviewSchema, 
  replyReviewSchema, 
  reportReviewSchema 
} from '../validators/reviewValidator.js';
import { ValidationError, ForbiddenError } from '../../../utils/errors.js';
import authEventEmitter from '../../../utils/eventEmitter.js';

class ReviewController {
  createReview = async (req, res, next) => {
    try {
      const parsed = createReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const review = await reviewService.createReview(req.user._id, parsed.data);
      
      // Dispatch events (Vite/Node backend leverages event handlers)
      if (req.io) {
        req.io.emit('review.created', { reviewId: review._id, category: review.category });
      }
      authEventEmitter.emit('review:created', { review });

      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (req, res, next) => {
    try {
      const parsed = updateReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const review = await reviewService.updateReview(req.params.id, req.user._id, parsed.data);

      if (req.io) {
        req.io.emit('review.updated', { reviewId: review._id });
      }

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req, res, next) => {
    try {
      await reviewService.deleteReview(req.params.id, req.user._id, req.user.role);

      if (req.io) {
        req.io.emit('review.deleted', { reviewId: req.params.id });
      }

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  addReply = async (req, res, next) => {
    try {
      const parsed = replyReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const review = await reviewService.addReply(req.params.id, req.user._id, parsed.data.content);

      if (req.io) {
        req.io.emit('review.reply.created', { reviewId: review._id });
      }
      authEventEmitter.emit('review:replied', { review, reply: review.reply });

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  voteHelpful = async (req, res, next) => {
    try {
      const { voteType } = req.body;
      if (!['helpful', 'unhelpful'].includes(voteType)) {
        throw new ValidationError('voteType must be helpful or unhelpful');
      }

      const review = await reviewService.voteHelpful(req.params.id, req.user._id, voteType);

      authEventEmitter.emit('review:voted', { review, userId: req.user._id, voteType });

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  reportReview = async (req, res, next) => {
    try {
      const parsed = reportReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const review = await reviewService.reportReview(
        req.params.id, 
        req.user._id, 
        parsed.data.reason, 
        parsed.data.explanation
      );

      if (req.io) {
        req.io.emit('review.reported', { reviewId: review._id });
      }

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviews = async (req, res, next) => {
    try {
      const { category, propertyId, ownerId, roommateId, status, sort, page, limit, verifiedOnly, photosOnly } = req.query;
      const reviews = await reviewService.getReviews(
        { category, propertyId, ownerId, roommateId, status, verifiedOnly, photosOnly },
        { sort, page, limit }
      );

      res.status(200).json({
        success: true,
        ...reviews,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewStats = async (req, res, next) => {
    try {
      const { category, targetId } = req.query;
      if (!category || !targetId) {
        throw new ValidationError('category and targetId are required queries.');
      }
      const stats = await reviewService.getReviewStats(category, targetId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  getReputationScore = async (req, res, next) => {
    try {
      const reputation = await reputationService.calculateUserReputation(req.params.userId);
      res.status(200).json({
        success: true,
        data: reputation,
      });
    } catch (error) {
      next(error);
    }
  };

  // Moderation controllers
  getReports = async (req, res, next) => {
    try {
      // Find all flagged or reported reviews
      const reports = await reviewService.getReviews({ status: 'flagged' }, { limit: 100, page: 1 });
      
      // Format as standard admin report objects
      const formatted = [];
      reports.items.forEach(review => {
        review.reports.forEach(rep => {
          formatted.push({
            _id: rep._id || rep.reporterId,
            reviewId: review._id,
            category: review.category,
            reporterId: rep.reporterId,
            reason: rep.reason,
            explanation: rep.explanation,
            status: rep.status,
            createdAt: rep.createdAt,
            reviewAuthor: review.authorId,
            reviewContent: review.content,
            rating: review.rating
          });
        });
      });

      res.status(200).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      next(error);
    }
  };

  resolveReport = async (req, res, next) => {
    try {
      const { status } = req.body; // 'resolved' or 'dismissed'
      const { reviewId, reportId } = req.params;
      
      const review = await reviewService.resolveReport(reviewId, reportId, status);
      
      // If resolving the report implies hiding/blocking, update review status
      if (status === 'resolved') {
        const action = req.body.action; // 'hide' or 'keep_active'
        if (action === 'hide') {
          await reviewService.updateReview(reviewId, review.authorId._id || review.authorId, { status: 'hidden' });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Report resolved successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new ReviewController();
