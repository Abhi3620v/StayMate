import roommateRepository from '../repositories/roommateRepository.js';
import compatibilityService from './compatibilityService.js';

class MatchService {
  /**
   * Discovers roommate profiles matching criteria and computes compatibility scores.
   *
   * @param {string} userId - Current logged-in user ID
   * @param {Object} filters - Search and filtering criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Object} list of profiles with scores and pagination info
   */
  async discoverMatches(userId, filters = {}, options = {}) {
    const { sort = 'compatibility', page = 1, limit = 12 } = options;
    const skip = (page - 1) * limit;

    // 1. Retrieve current user's roommate profile for compatibility scoring
    const currentUserProfile = await roommateRepository.findByUserId(userId);

    // 2. Build filters for candidate query
    const dbFilters = {
      userId: { $ne: userId }, // Exclude self
      visibility: { $in: ['public', 'only_logged_in'] }, // Exclude private
    };

    // Apply basic info filters
    if (filters.gender) {
      dbFilters['basicInfo.gender'] = filters.gender;
    }
    if (filters.occupation) {
      dbFilters['basicInfo.occupation'] = filters.occupation;
    }
    if (filters.city) {
      dbFilters['locationPreferences.city'] = { $regex: new RegExp(`^${filters.city.trim()}$`, 'i') };
    }

    // Apply budget filters
    if (filters.maxRent) {
      dbFilters['budget.monthlyRent'] = { $lte: Number(filters.maxRent) };
    }

    // Apply lifestyle filters
    if (filters.smoking !== undefined) {
      dbFilters['lifestyle.smoking'] = filters.smoking === 'true' || filters.smoking === true;
    }
    if (filters.drinking !== undefined) {
      dbFilters['lifestyle.drinking'] = filters.drinking === 'true' || filters.drinking === true;
    }
    if (filters.pets !== undefined) {
      dbFilters['lifestyle.pets'] = filters.pets === 'true' || filters.pets === true;
    }
    if (filters.foodPreference && filters.foodPreference !== 'any') {
      dbFilters['lifestyle.foodPreference'] = filters.foodPreference;
    }

    // Languages filter
    if (filters.language) {
      dbFilters.languagesSpoken = { $in: [filters.language] };
    }

    // 3. Fetch candidates (Note: we fetch matching records, compute score in JS, and filter/sort)
    // To ensure correct sorting by compatibility, we fetch candidates and sort in-memory.
    // In production database, we would query the matching pool. For large datasets we'd use aggregation,
    // but on this codebase scope we retrieve candidates and compute in-memory.
    const candidates = await roommateRepository.find(dbFilters, { limit: 1000, skip: 0 });

    // 4. Calculate compatibility scores
    let matchedProfiles = candidates.map((candidate) => {
      // Compatibility is only calculated if current user has a completed profile
      const compat = currentUserProfile
        ? compatibilityService.calculateCompatibility(currentUserProfile, candidate)
        : { score: 0, breakdown: {} };

      // Convert mongoose document if applicable
      const candidateObj = candidate.toObject ? candidate.toObject() : candidate;

      return {
        ...candidateObj,
        compatibilityScore: compat.score,
        compatibilityBreakdown: compat.breakdown,
      };
    });

    // 5. Apply compatibility score range filter
    if (filters.minCompatibility) {
      matchedProfiles = matchedProfiles.filter((p) => p.compatibilityScore >= Number(filters.minCompatibility));
    }
    if (filters.maxCompatibility) {
      matchedProfiles = matchedProfiles.filter((p) => p.compatibilityScore <= Number(filters.maxCompatibility));
    }

    // 6. Sort results
    if (sort === 'compatibility') {
      matchedProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } else if (sort === 'newest') {
      matchedProfiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'budget') {
      // Sort by monthlyRent ascending
      matchedProfiles.sort((a, b) => a.budget.monthlyRent - b.budget.monthlyRent);
    } else if (sort === 'nearest_budget' && currentUserProfile) {
      // Sort by proximity to current user's budget
      const targetRent = currentUserProfile.budget.monthlyRent;
      matchedProfiles.sort(
        (a, b) =>
          Math.abs(a.budget.monthlyRent - targetRent) - Math.abs(b.budget.monthlyRent - targetRent)
      );
    } else if (sort === 'move_in_date') {
      matchedProfiles.sort((a, b) => new Date(a.moveInDate) - new Date(b.moveInDate));
    }

    // 7. Paginate
    const totalCount = matchedProfiles.length;
    const paginatedProfiles = matchedProfiles.slice(skip, skip + limit);

    return {
      success: true,
      data: paginatedProfiles,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Number(page),
        limit: Number(limit),
      },
    };
  }

  /**
   * Computes compatibility score directly between two specific profiles.
   */
  async getProfileCompatibility(profileId, currentUserId) {
    const targetProfile = await roommateRepository.findById(profileId);
    const currentUserProfile = await roommateRepository.findByUserId(currentUserId);

    if (!targetProfile) {
      throw new Error('Roommate profile not found');
    }

    if (!currentUserProfile) {
      return { score: 0, breakdown: {}, message: 'Complete your profile to view compatibility details.' };
    }

    const compat = compatibilityService.calculateCompatibility(currentUserProfile, targetProfile);
    return {
      score: compat.score,
      breakdown: compat.breakdown,
    };
  }
}

const matchService = new MatchService();
export default matchService;
export { matchService };
