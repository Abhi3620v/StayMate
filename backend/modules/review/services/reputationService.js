import User from '../../../models/User.js';
import Roommate from '../../../models/Roommate.js';
import VisitRequest from '../../../models/VisitRequest.js';
import RoommateRequest from '../../../models/RoommateRequest.js';
import Review from '../../../models/Review.js';
import { isDbConnected, mockUsers, mockVisitRequests } from '../../../config/inMemoryDb.js';
import { mockReviews } from '../repositories/reviewRepository.js';

class ReputationService {
  /**
   * Calculates dynamic reputation score for any user (0 to 100)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} { score, breakdown, level }
   */
  async calculateUserReputation(userId) {
    let score = 50; // Base baseline score
    const breakdown = {
      base: 50,
      rating: 0,
      profileCompletion: 0,
      verification: 0,
      interactions: 0,
      penalties: 0
    };

    const uid = String(userId);

    // 1. Fetch User details, Roommate Profile, etc.
    let user = null;
    let roommateProfile = null;
    let successfulVisitsCount = 0;
    let successfulMatchesCount = 0;
    let resolvedReportsCount = 0;
    let reviewsList = [];

    if (isDbConnected()) {
      user = await User.findById(uid);
      roommateProfile = await Roommate.findOne({ userId: uid });
      
      // Successful visits (accepted tours where user is owner or tenant)
      successfulVisitsCount = await VisitRequest.countDocuments({
        $or: [{ ownerId: uid }, { tenantId: uid }],
        status: 'accepted'
      });

      // Successful roommate matches (accepted connections where user is sender or receiver)
      successfulMatchesCount = await RoommateRequest.countDocuments({
        $or: [{ senderId: uid }, { receiverId: uid }],
        status: 'accepted'
      });

      // Reviews written about this user or their properties
      reviewsList = await Review.find({
        $or: [{ ownerId: uid }, { roommateId: uid }],
        status: { $in: ['active', 'flagged'] }
      });

      // Count resolved flags against this user (e.g. from roommate reports or review flags)
      resolvedReportsCount = await Review.countDocuments({
        authorId: uid,
        'reports.status': 'resolved'
      });
    } else {
      user = mockUsers.find(u => String(u._id) === uid);
      // Fallback mocks
      successfulVisitsCount = mockVisitRequests.filter(v => 
        (String(v.ownerId) === uid || String(v.tenantId) === uid) && v.status === 'accepted'
      ).length;
      reviewsList = mockReviews.filter(r => 
        (String(r.ownerId) === uid || String(r.roommateId) === uid) && ['active', 'flagged'].includes(r.status)
      );
    }

    // 2. Average Rating Component (+30 points max)
    if (reviewsList.length > 0) {
      const sum = reviewsList.reduce((s, r) => s + r.rating, 0);
      const avg = sum / reviewsList.length;
      // Convert 1-5 rating into 0-30 points
      breakdown.rating = parseFloat(((avg / 5) * 30).toFixed(2));
      score += breakdown.rating;
    }

    // 3. Profile Completion Component (+10 points max)
    if (roommateProfile) {
      // Roommate profiles have completion percentage
      const completion = roommateProfile.completionPercentage || 0;
      breakdown.profileCompletion = parseFloat((completion / 10).toFixed(2));
    } else if (user) {
      // General profile completion check
      let fieldsCount = 0;
      if (user.name) fieldsCount++;
      if (user.email) fieldsCount++;
      if (user.avatar) fieldsCount++;
      if (user.role && user.role !== 'guest') fieldsCount++;
      breakdown.profileCompletion = fieldsCount * 2.5; // max 10 points
    }
    score += breakdown.profileCompletion;

    // 4. Verified Status Component (+15 points)
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      breakdown.verification = 15;
    } else if (roommateProfile && roommateProfile.isVerified) {
      breakdown.verification = 15;
    } else if (user && user.status === 'active') {
      breakdown.verification = 10;
    }
    score += breakdown.verification;

    // 5. Successful Visits & Roommate Matches Component (+5 points each, max 15)
    const totalInteractions = successfulVisitsCount + successfulMatchesCount;
    breakdown.interactions = Math.min(totalInteractions * 5, 15);
    score += breakdown.interactions;

    // 6. Report History Penalties (-10 points per flag, capped at -50 points)
    breakdown.penalties = Math.max(resolvedReportsCount * -10, -50);
    score += breakdown.penalties;

    // Constrain final score to [0, 100] range
    const finalScore = Math.max(0, Math.min(Math.round(score), 100));

    // Determine reputation level label
    let level = 'Fair';
    if (finalScore >= 90) level = 'Outstanding';
    else if (finalScore >= 80) level = 'Excellent';
    else if (finalScore >= 70) level = 'Good';
    else if (finalScore >= 50) level = 'Fair';
    else level = 'Needs Improvement';

    return {
      score: finalScore,
      breakdown,
      level
    };
  }
}

export default new ReputationService();
