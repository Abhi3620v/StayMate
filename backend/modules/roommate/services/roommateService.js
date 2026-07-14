import roommateRepository from '../repositories/roommateRepository.js';
import authEventEmitter from '../../../utils/eventEmitter.js';
import { ConflictError, ValidationError, NotFoundError } from '../../../utils/errors.js';

class RoommateService {
  /**
   * Calculates roommate profile completion percentage and gathers missing items.
   */
  calculateCompleteness(profile) {
    if (!profile) {
      return { percentage: 0, missingInformation: [], suggestedNextAction: 'Create Profile' };
    }

    const missingInformation = [];
    let score = 0;

    // 1. Basic Info Section (25% total - 5% each)
    const basic = profile.basicInfo || {};
    const basicFields = [
      { key: 'occupation', label: 'Provide Occupation' },
      { key: 'collegeOrCompany', label: 'Provide College/Company' },
      { key: 'age', label: 'Provide Age' },
      { key: 'gender', label: 'Select Gender' },
      { key: 'bio', label: 'Add Bio Description' },
    ];
    basicFields.forEach((field) => {
      if (basic[field.key] !== undefined && String(basic[field.key]).trim() !== '') {
        score += 5;
      } else {
        missingInformation.push(field);
      }
    });

    // 2. Lifestyle Preferences Section (35% total)
    const lifestyle = profile.lifestyle || {};
    const lifestyleKeys = [
      'sleepingSchedule',
      'wakeUpTime',
      'foodPreference',
      'smoking',
      'drinking',
      'pets',
      'guests',
      'cleanliness',
      'noisePreference',
      'studyEnvironment',
      'workFromHome',
      'socialLifestyle',
    ];
    let lifestyleScore = 0;
    lifestyleKeys.forEach((key) => {
      if (lifestyle[key] !== undefined && String(lifestyle[key]).trim() !== '') {
        lifestyleScore += 35 / lifestyleKeys.length;
      }
    });
    if (lifestyleScore > 0) {
      score += Math.round(lifestyleScore);
    }
    if (lifestyleScore < 35) {
      missingInformation.push({ key: 'lifestyle', label: 'Add Lifestyle Details' });
    }

    // 3. Budget Preferences Section (15% total - 3.75% each)
    const budget = profile.budget || {};
    const budgetFields = [
      { key: 'monthlyRent', label: 'Preferred Rent Budget' },
      { key: 'securityDeposit', label: 'Preferred Security Deposit' },
      { key: 'propertyType', label: 'Preferred Property Type' },
      { key: 'listingType', label: 'Preferred Listing Type' },
    ];
    budgetFields.forEach((field) => {
      if (budget[field.key] !== undefined && String(budget[field.key]).trim() !== '') {
        score += 3.75;
      } else {
        missingInformation.push(field);
      }
    });

    // 4. Location Preferences Section (15% total - 5% each)
    const loc = profile.locationPreferences || {};
    const locFields = [
      { key: 'city', label: 'Preferred City' },
      { key: 'area', label: 'Preferred Area' },
      { key: 'maxDistance', label: 'Preferred Max Distance' },
    ];
    locFields.forEach((field) => {
      if (loc[field.key] !== undefined && String(loc[field.key]).trim() !== '') {
        score += 5;
      } else {
        missingInformation.push(field);
      }
    });

    // 5. Languages Spoken (5% total)
    if (Array.isArray(profile.languagesSpoken) && profile.languagesSpoken.length > 0) {
      score += 5;
    } else {
      missingInformation.push({ key: 'languagesSpoken', label: 'Select Spoken Languages' });
    }

    // 6. Move-in Date, Hobbies/Interests, Profile Picture (5% total)
    let extraPoints = 0;
    if (profile.moveInDate) extraPoints += 1.5;
    else missingInformation.push({ key: 'moveInDate', label: 'Choose Move-in Date' });

    if (profile.profilePicture && profile.profilePicture !== '') extraPoints += 2.0;
    else missingInformation.push({ key: 'profilePicture', label: 'Upload Profile Picture' });

    if (Array.isArray(profile.hobbies) && profile.hobbies.length > 0) extraPoints += 1.5;
    else missingInformation.push({ key: 'hobbies', label: 'Add Hobbies & Interests' });

    score += extraPoints;

    const percentage = Math.min(Math.round(score), 100);
    const suggestedNextAction = missingInformation.length > 0 ? missingInformation[0].label : 'Profile Complete!';

    return {
      percentage,
      missingInformation,
      suggestedNextAction,
    };
  }

  /**
   * Creates a new roommate profile.
   */
  async createProfile(userId, profileData) {
    const existingProfile = await roommateRepository.findByUserId(userId);
    if (existingProfile) {
      throw new ConflictError('A roommate profile already exists for this user account.');
    }

    // Calculate completeness
    const completeness = this.calculateCompleteness(profileData);
    const mergedData = {
      ...profileData,
      userId,
      completionPercentage: completeness.percentage,
    };

    const newProfile = await roommateRepository.create(mergedData);

    // Emit event
    authEventEmitter.emit('roommate.profile.created', { profile: newProfile });

    return newProfile;
  }

  /**
   * Updates an existing roommate profile.
   */
  async updateProfile(userId, profileData) {
    const profile = await roommateRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Roommate profile not found.');
    }

    // Recalculate completeness
    const completeness = this.calculateCompleteness(profileData);
    const mergedData = {
      ...profileData,
      completionPercentage: completeness.percentage,
    };

    const updatedProfile = await roommateRepository.update(userId, mergedData);

    // Emit event
    authEventEmitter.emit('roommate.profile.updated', { profile: updatedProfile });

    return updatedProfile;
  }

  /**
   * Deletes a roommate profile.
   */
  async deleteProfile(userId) {
    const profile = await roommateRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Roommate profile not found.');
    }
    return await roommateRepository.delete(userId);
  }

  /**
   * Fetches roommate profile by owner user ID.
   */
  async getProfileByUserId(userId) {
    const profile = await roommateRepository.findByUserId(userId);
    if (!profile) {
      return null;
    }
    return profile;
  }

  /**
   * Fetches profile details by roommate ID, logging history.
   */
  async getProfileById(id, currentUserId = null) {
    const profile = await roommateRepository.findById(id);
    if (!profile) {
      throw new NotFoundError('Roommate profile not found.');
    }

    // Log view history if viewer is a different user
    if (currentUserId && String(profile.userId._id || profile.userId) !== String(currentUserId)) {
      await roommateRepository.logRecentView(currentUserId, id);
    }

    return profile;
  }

  // Favorites
  async toggleFavorite(userId, roommateId) {
    const profile = await roommateRepository.findById(roommateId);
    if (!profile) {
      throw new NotFoundError('Roommate profile not found.');
    }
    return await roommateRepository.toggleFavorite(userId, roommateId);
  }

  async getFavorites(userId) {
    return await roommateRepository.getFavorites(userId);
  }

  // Recent Views
  async getRecentViews(userId) {
    return await roommateRepository.getRecentViews(userId);
  }

  // Reporting profiles
  async reportProfile(reporterId, data) {
    const reportData = {
      reporterId,
      roommateId: data.roommateId,
      reason: data.reason,
      description: data.description || '',
    };

    const report = await roommateRepository.createReport(reportData);

    // Emit event
    authEventEmitter.emit('roommate.profile.reported', { report });

    return report;
  }

  // Admin Actions
  async getReports() {
    return await roommateRepository.getReports();
  }

  async resolveReport(reportId, resolverId, resolutionData) {
    const data = {
      status: resolutionData.status,
      resolutionNotes: resolutionData.resolutionNotes,
      resolvedBy: resolverId,
    };
    return await roommateRepository.resolveReport(reportId, data);
  }
}

const roommateService = new RoommateService();
export default roommateService;
export { roommateService };
