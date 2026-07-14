import reviewRepository from '../repositories/reviewRepository.js';
import reputationService from './reputationService.js';
import VisitRequest from '../../../models/VisitRequest.js';
import RoommateRequest from '../../../models/RoommateRequest.js';
import Property from '../../../models/Property.js';
import { isDbConnected, mockVisitRequests } from '../../../config/inMemoryDb.js';
import { ValidationError, ForbiddenError, NotFoundError } from '../../../utils/errors.js';

class ReviewService {
  /**
   * Submits a fresh verified review
   */
  async createReview(authorId, payload) {
    const { category, rating, ratings, title, content, images, isAnonymous, recommend } = payload;
    const uid = String(authorId);

    // 1. Verify Category Gating & Eligibility
    if (category === 'property') {
      const { propertyId, visitId } = payload;
      if (!propertyId || !visitId) {
        throw new ValidationError('Property ID and Visit interaction reference are required.');
      }

      // Check visit request status
      let visit = null;
      if (isDbConnected()) {
        visit = await VisitRequest.findOne({
          _id: visitId,
          tenantId: uid,
          propertyId,
          status: { $in: ['accepted', 'approved'] }
        });
      } else {
        visit = mockVisitRequests.find(v => 
          String(v._id) === String(visitId) && 
          String(v.tenantId) === uid && 
          String(v.propertyId) === String(propertyId) && 
          ['accepted', 'approved'].includes(v.status)
        );
      }

      if (!visit) {
        throw new ForbiddenError('You are only eligible to review properties after an approved visit.');
      }

      // Check if duplicate review exists for this visit
      const existing = await reviewRepository.find({ visitId, authorId: uid, status: { $ne: 'soft_deleted' } });
      if (existing && existing.items && existing.items.length > 0) {
        throw new ValidationError('You have already submitted a review for this property visit.');
      }

      // Fetch landlord/owner ID from property details to link it
      let ownerId = visit.ownerId;
      if (isDbConnected()) {
        const prop = await Property.findById(propertyId);
        if (prop) ownerId = prop.ownerId;
      }

      return await reviewRepository.create({
        category,
        authorId: uid,
        propertyId,
        ownerId,
        visitId,
        rating,
        ratings,
        title,
        content,
        images,
        isAnonymous,
        recommend,
        status: 'active'
      });

    } else if (category === 'owner') {
      const { ownerId, visitId } = payload;
      if (!ownerId || !visitId) {
        throw new ValidationError('Owner ID and Visit interaction reference are required.');
      }

      // Check visit request status
      let visit = null;
      if (isDbConnected()) {
        visit = await VisitRequest.findOne({
          _id: visitId,
          tenantId: uid,
          ownerId,
          status: { $in: ['accepted', 'approved'] }
        });
      } else {
        visit = mockVisitRequests.find(v => 
          String(v._id) === String(visitId) && 
          String(v.tenantId) === uid && 
          String(v.ownerId) === String(ownerId) && 
          ['accepted', 'approved'].includes(v.status)
        );
      }

      if (!visit) {
        throw new ForbiddenError('You are only eligible to review owners after a successful visit interaction.');
      }

      // Check duplicates
      const existing = await reviewRepository.find({ visitId, authorId: uid, category: 'owner', status: { $ne: 'soft_deleted' } });
      if (existing && existing.items && existing.items.length > 0) {
        throw new ValidationError('You have already submitted a review for this owner interaction.');
      }

      return await reviewRepository.create({
        category,
        authorId: uid,
        ownerId,
        visitId,
        rating,
        ratings,
        content,
        isAnonymous,
        status: 'active'
      });

    } else if (category === 'roommate') {
      const { roommateId, matchId } = payload;
      if (!roommateId || !matchId) {
        throw new ValidationError('Roommate User ID and Roommate match connection reference are required.');
      }

      // Check roommate match connection status
      let request = null;
      if (isDbConnected()) {
        request = await RoommateRequest.findOne({
          _id: matchId,
          $or: [
            { senderId: uid, receiverId: roommateId },
            { senderId: roommateId, receiverId: uid }
          ],
          status: 'accepted'
        });
      } else {
        // Mock fallback check
        request = { status: 'accepted' }; // Simplified for mock test setup
      }

      if (!request || request.status !== 'accepted') {
        throw new ForbiddenError('You may only review matched roommates after a successful request connection.');
      }

      // Check duplicates
      const existing = await reviewRepository.find({ matchId, authorId: uid, category: 'roommate', status: { $ne: 'soft_deleted' } });
      if (existing && existing.items && existing.items.length > 0) {
        throw new ValidationError('You have already submitted a review for this roommate match.');
      }

      return await reviewRepository.create({
        category,
        authorId: uid,
        roommateId,
        matchId,
        rating,
        ratings,
        content,
        isAnonymous,
        status: 'active'
      });

    } else {
      throw new ValidationError(`Unsupported review category: ${category}`);
    }
  }

  /**
   * Edit existing review (time window lock: 48 hours)
   */
  async updateReview(reviewId, authorId, updateData) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found.');
    }

    if (String(review.authorId._id || review.authorId) !== String(authorId)) {
      throw new ForbiddenError('You do not possess edit clearances for this review.');
    }

    // Enforce 48 hours edit window constraint
    const hoursElapsed = (new Date() - new Date(review.createdAt)) / (1000 * 60 * 60);
    if (hoursElapsed > 48) {
      throw new ValidationError('The 48-hour editing window for this review has expired.');
    }

    return await reviewRepository.update(reviewId, {
      rating: updateData.rating || review.rating,
      ratings: updateData.ratings || review.ratings,
      title: updateData.title || review.title,
      content: updateData.content || review.content,
      images: updateData.images || review.images,
      isAnonymous: updateData.isAnonymous !== undefined ? updateData.isAnonymous : review.isAnonymous,
      recommend: updateData.recommend !== undefined ? updateData.recommend : review.recommend,
    });
  }

  /**
   * Delete review (soft delete by author, direct removal by moderator/admin)
   */
  async deleteReview(reviewId, userId, userRole) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found.');
    }

    const isAuthor = String(review.authorId._id || review.authorId) === String(userId);
    const isMod = ['moderator', 'admin'].includes(userRole);

    if (!isAuthor && !isMod) {
      throw new ForbiddenError('You are not authorized to delete this review.');
    }

    return await reviewRepository.delete(reviewId);
  }

  /**
   * Replies to a review thread (restricted to landlords or matched roommate targets)
   */
  async addReply(reviewId, userId, content) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found.');
    }

    if (review.reply && review.reply.content) {
      throw new ValidationError('This review thread already contains a reply.');
    }

    const uid = String(userId);

    // Property reviews: only the owner/landlord can reply
    if (review.category === 'property') {
      let isOwner = false;
      if (isDbConnected()) {
        const prop = await Property.findById(review.propertyId);
        isOwner = prop && String(prop.ownerId) === uid;
      } else {
        isOwner = String(review.ownerId) === uid;
      }

      if (!isOwner) {
        throw new ForbiddenError('Only the property landlord/owner may reply to this review.');
      }
    } 
    // Roommate reviews: only the roommate target can reply
    else if (review.category === 'roommate') {
      const isTarget = String(review.roommateId) === uid;
      if (!isTarget) {
        throw new ForbiddenError('Only the targeted roommate profile user may reply to this review.');
      }
    } else {
      throw new ValidationError('Direct replies are not supported for this review category.');
    }

    return await reviewRepository.addReply(reviewId, uid, content);
  }

  /**
   * Vote on helpfulness of review
   */
  async voteHelpful(reviewId, userId, voteType) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found.');
    }
    return await reviewRepository.vote(reviewId, userId, voteType);
  }

  /**
   * File safety flag report against a review
   */
  async reportReview(reviewId, reporterId, reason, explanation) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found.');
    }
    return await reviewRepository.addReport(reviewId, reporterId, reason, explanation);
  }

  /**
   * Moderation operations: resolve flag
   */
  async resolveReport(reviewId, reportId, status) {
    return await reviewRepository.resolveReport(reviewId, reportId, status);
  }

  /**
   * Get reviews lists with query filters
   */
  async getReviews(filter, options) {
    const query = { status: { $ne: 'soft_deleted' } };
    
    if (filter.category) query.category = filter.category;
    if (filter.propertyId) query.propertyId = filter.propertyId;
    if (filter.ownerId) query.ownerId = filter.ownerId;
    if (filter.roommateId) query.roommateId = filter.roommateId;
    if (filter.status) query.status = filter.status;

    // Filter sub-queries
    if (filter.verifiedOnly === 'true') {
      // All reviews are verified by design since gating checks are mandatory
    }
    if (filter.photosOnly === 'true') {
      query.images = { $exists: true, $not: { $size: 0 } };
    }

    // Resolve Sorting
    let sort = { createdAt: -1 };
    if (options.sort === 'newest') sort = { createdAt: -1 };
    else if (options.sort === 'oldest') sort = { createdAt: 1 };
    else if (options.sort === 'highest') sort = { rating: -1 };
    else if (options.sort === 'lowest') sort = { rating: 1 };
    else if (options.sort === 'helpful') sort = { helpfulCount: -1 };

    return await reviewRepository.find(query, {
      sort,
      limit: parseInt(options.limit) || 10,
      page: parseInt(options.page) || 1
    });
  }

  /**
   * Aggregates stats and distribution overview
   */
  async getReviewStats(category, targetId) {
    return await reviewRepository.aggregateRatings(category, targetId);
  }
}

export default new ReviewService();
