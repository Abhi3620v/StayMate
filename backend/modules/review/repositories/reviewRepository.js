import mongoose from 'mongoose';
import Review from '../../../models/Review.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

let mockReviews = [];

class ReviewRepository {
  async create(data) {
    if (isDbConnected()) {
      const review = await Review.create(data);
      return await review.populate('authorId', 'name email avatar');
    } else {
      const newReview = {
        _id: 'rev-' + Math.random().toString(36).substr(2, 9),
        ...data,
        ratings: data.ratings instanceof Map ? data.ratings : new Map(Object.entries(data.ratings || {})),
        votes: [],
        helpfulCount: 0,
        notHelpfulCount: 0,
        reports: [],
        status: data.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockReviews.push(newReview);
      return newReview;
    }
  }

  async findById(id) {
    if (isDbConnected()) {
      return await Review.findById(id)
        .populate('authorId', 'name email avatar')
        .populate('reply.authorId', 'name email avatar');
    } else {
      return mockReviews.find(r => String(r._id) === String(id));
    }
  }

  async find(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query = Review.find(filter);
      
      // Handle Sorting
      query.sort(sort);
      
      // Pagination
      query.skip(skip).limit(limit);
      
      const items = await query
        .populate('authorId', 'name email avatar')
        .populate('reply.authorId', 'name email avatar');
        
      const total = await Review.countDocuments(filter);
      
      return { items, total, page, limit };
    } else {
      let filtered = [...mockReviews].filter(r => {
        for (const [key, val] of Object.entries(filter)) {
          if (key === 'status') {
            if (val && typeof val === 'object' && '$ne' in val) {
              if (r.status === val.$ne) return false;
            } else {
              if (r.status !== val) return false;
            }
          } else if (key === 'authorId') {
            if (String(r.authorId) !== String(val)) return false;
          } else if (key === 'category') {
            if (r.category !== val) return false;
          } else if (key === 'propertyId') {
            if (String(r.propertyId) !== String(val)) return false;
          } else if (key === 'ownerId') {
            if (String(r.ownerId) !== String(val)) return false;
          } else if (key === 'roommateId') {
            if (String(r.roommateId) !== String(val)) return false;
          } else if (key === 'visitId') {
            if (String(r.visitId) !== String(val)) return false;
          } else if (key === 'matchId') {
            if (String(r.matchId) !== String(val)) return false;
          }
        }
        return true;
      });

      // Sorting
      const sortField = Object.keys(sort)[0] || 'createdAt';
      const sortOrder = sort[sortField]; // 1 or -1
      filtered.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'helpfulCount') {
          valA = a.helpfulCount || 0;
          valB = b.helpfulCount || 0;
        }
        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();
        
        if (valA < valB) return sortOrder === 1 ? -1 : 1;
        if (valA > valB) return sortOrder === 1 ? 1 : -1;
        return 0;
      });

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);

      return {
        items: paginated,
        total,
        page,
        limit
      };
    }
  }

  async update(id, updateData) {
    if (isDbConnected()) {
      return await Review.findByIdAndUpdate(id, updateData, { new: true })
        .populate('authorId', 'name email avatar')
        .populate('reply.authorId', 'name email avatar');
    } else {
      const idx = mockReviews.findIndex(r => String(r._id) === String(id));
      if (idx !== -1) {
        mockReviews[idx] = {
          ...mockReviews[idx],
          ...updateData,
          updatedAt: new Date()
        };
        return mockReviews[idx];
      }
      return null;
    }
  }

  async delete(id) {
    if (isDbConnected()) {
      return await Review.findByIdAndUpdate(id, { status: 'soft_deleted' }, { new: true });
    } else {
      const idx = mockReviews.findIndex(r => String(r._id) === String(id));
      if (idx !== -1) {
        mockReviews[idx].status = 'soft_deleted';
        return mockReviews[idx];
      }
      return null;
    }
  }

  async vote(reviewId, userId, voteType) {
    if (isDbConnected()) {
      const review = await Review.findById(reviewId);
      if (!review) return null;

      // Filter existing votes
      const existingVoteIdx = review.votes.findIndex(v => String(v.userId) === String(userId));
      if (existingVoteIdx !== -1) {
        const existingVote = review.votes[existingVoteIdx];
        if (existingVote.voteType === voteType) {
          // Double voting the same thing removes the vote
          review.votes.splice(existingVoteIdx, 1);
        } else {
          // Change vote type
          existingVote.voteType = voteType;
        }
      } else {
        // Add new vote
        review.votes.push({ userId, voteType });
      }

      // Recalculate counts
      review.helpfulCount = review.votes.filter(v => v.voteType === 'helpful').length;
      review.notHelpfulCount = review.votes.filter(v => v.voteType === 'unhelpful').length;

      await review.save();
      return review;
    } else {
      const review = mockReviews.find(r => String(r._id) === String(reviewId));
      if (!review) return null;

      const uidStr = String(userId);
      const existingIdx = review.votes.findIndex(v => String(v.userId) === uidStr);
      if (existingIdx !== -1) {
        const existing = review.votes[existingIdx];
        if (existing.voteType === voteType) {
          review.votes.splice(existingIdx, 1);
        } else {
          existing.voteType = voteType;
        }
      } else {
        review.votes.push({ userId: uidStr, voteType });
      }

      review.helpfulCount = review.votes.filter(v => v.voteType === 'helpful').length;
      review.notHelpfulCount = review.votes.filter(v => v.voteType === 'unhelpful').length;
      review.updatedAt = new Date();
      return review;
    }
  }

  async addReport(reviewId, reporterId, reason, explanation) {
    if (isDbConnected()) {
      const review = await Review.findById(reviewId);
      if (!review) return null;

      review.reports.push({
        reporterId,
        reason,
        explanation,
        status: 'pending',
        createdAt: new Date()
      });
      review.status = 'flagged';

      await review.save();
      return review;
    } else {
      const review = mockReviews.find(r => String(r._id) === String(reviewId));
      if (!review) return null;

      review.reports.push({
        _id: 'rep-' + Math.random().toString(36).substr(2, 9),
        reporterId: String(reporterId),
        reason,
        explanation,
        status: 'pending',
        createdAt: new Date()
      });
      review.status = 'flagged';
      review.updatedAt = new Date();
      return review;
    }
  }

  async resolveReport(reviewId, reportId, resolutionStatus) {
    if (isDbConnected()) {
      const review = await Review.findById(reviewId);
      if (!review) return null;

      const report = review.reports.id(reportId);
      if (report) {
        report.status = resolutionStatus; // 'resolved' or 'dismissed'
      }

      // Check if all reports resolved, if yes, reset status
      const hasPending = review.reports.some(r => r.status === 'pending');
      if (!hasPending && review.status === 'flagged') {
        review.status = 'active';
      }

      await review.save();
      return review;
    } else {
      const review = mockReviews.find(r => String(r._id) === String(reviewId));
      if (!review) return null;

      const report = review.reports.find(r => String(r._id) === String(reportId) || String(r.reporterId) === String(reportId));
      if (report) {
        report.status = resolutionStatus;
      }

      const hasPending = review.reports.some(r => r.status === 'pending');
      if (!hasPending && review.status === 'flagged') {
        review.status = 'active';
      }
      review.updatedAt = new Date();
      return review;
    }
  }

  async addReply(reviewId, authorId, content) {
    if (isDbConnected()) {
      const review = await Review.findById(reviewId);
      if (!review) return null;

      review.reply = {
        authorId,
        content,
        createdAt: new Date()
      };

      await review.save();
      return await review.populate('reply.authorId', 'name email avatar');
    } else {
      const review = mockReviews.find(r => String(r._id) === String(reviewId));
      if (!review) return null;

      review.reply = {
        authorId: String(authorId),
        content,
        createdAt: new Date()
      };
      review.updatedAt = new Date();
      return review;
    }
  }

  async aggregateRatings(category, targetId) {
    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }

      const match = {};
      if (category === 'property') {
        match.propertyId = new mongoose.Types.ObjectId(targetId);
      } else if (category === 'owner') {
        match.ownerId = new mongoose.Types.ObjectId(targetId);
      } else if (category === 'roommate') {
        match.roommateId = new mongoose.Types.ObjectId(targetId);
      }
      match.status = { $in: ['active', 'flagged'] };

      const agg = await Review.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      if (agg.length === 0) {
        return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      agg[0].ratingDistribution.forEach(r => {
        const floor = Math.floor(r);
        if (distribution[floor] !== undefined) {
          distribution[floor]++;
        }
      });

      return {
        averageRating: parseFloat(agg[0].averageRating.toFixed(2)),
        totalReviews: agg[0].totalReviews,
        distribution
      };
    } else {
      const filtered = mockReviews.filter(r => {
        if (r.status === 'soft_deleted' || r.status === 'hidden') return false;
        if (r.category !== category) return false;
        if (category === 'property' && String(r.propertyId) !== String(targetId)) return false;
        if (category === 'owner' && String(r.ownerId) !== String(targetId)) return false;
        if (category === 'roommate' && String(r.roommateId) !== String(targetId)) return false;
        return true;
      });

      if (filtered.length === 0) {
        return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }

      const total = filtered.length;
      const sum = filtered.reduce((s, r) => s + r.rating, 0);
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      filtered.forEach(r => {
        distribution[Math.floor(r.rating)]++;
      });

      return {
        averageRating: parseFloat((sum / total).toFixed(2)),
        totalReviews: total,
        distribution
      };
    }
  }

  clearMock() {
    mockReviews = [];
  }
}

export default new ReviewRepository();
export { mockReviews };
