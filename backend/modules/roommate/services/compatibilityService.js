class CompatibilityService {
  /**
   * Calculates compatibility percentage between two roommate profiles.
   * Weight breakdown:
   * - Budget: 20%
   * - Location: 20%
   * - Lifestyle: 35%
   * - Occupation: 10%
   * - Language: 10%
   * - Move-in Date: 5%
   *
   * @param {Object} profileA - Roommate profile A
   * @param {Object} profileB - Roommate profile B
   * @returns {Object} compatibility score and breakdown
   */
  calculateCompatibility(profileA, profileB) {
    if (!profileA || !profileB) {
      return { score: 0, breakdown: {} };
    }

    // --- 1. Budget Score (Max: 20) ---
    let budgetScore = 0;
    const rentA = profileA.budget?.monthlyRent || 0;
    const rentB = profileB.budget?.monthlyRent || 0;
    if (rentA > 0 && rentB > 0) {
      const maxRent = Math.max(rentA, rentB);
      const rentDiffRatio = Math.abs(rentA - rentB) / maxRent;

      if (rentDiffRatio <= 0.15) {
        budgetScore = 20;
      } else if (rentDiffRatio <= 0.30) {
        budgetScore = 15;
      } else if (rentDiffRatio <= 0.50) {
        budgetScore = 10;
      } else if (rentDiffRatio <= 0.70) {
        budgetScore = 5;
      }
    }

    // --- 2. Location Score (Max: 20) ---
    let locationScore = 0;
    const cityA = (profileA.locationPreferences?.city || '').toLowerCase().trim();
    const cityB = (profileB.locationPreferences?.city || '').toLowerCase().trim();
    const areaA = (profileA.locationPreferences?.area || '').toLowerCase().trim();
    const areaB = (profileB.locationPreferences?.area || '').toLowerCase().trim();

    if (cityA && cityA === cityB) {
      if (areaA && areaA === areaB) {
        locationScore = 20; // Exact city + area match
      } else {
        locationScore = 15; // Same city, different area
      }
    }

    // --- 3. Lifestyle Score (Max: 35) ---
    let lifestyleMatchCount = 0;
    const lifeA = profileA.lifestyle || {};
    const lifeB = profileB.lifestyle || {};

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

    const getCleanlinessStep = (val) => {
      if (val === 'high') return 2;
      if (val === 'moderate') return 1;
      return 0; // low
    };

    const getNoiseStep = (val) => {
      if (val === 'loud') return 2;
      if (val === 'moderate') return 1;
      return 0; // quiet
    };

    const getSocialStep = (val) => {
      if (val === 'extrovert') return 2;
      if (val === 'moderate') return 1;
      return 0; // introvert
    };

    lifestyleKeys.forEach((key) => {
      const valA = lifeA[key];
      const valB = lifeB[key];

      if (valA === undefined || valB === undefined) return;

      if (key === 'foodPreference') {
        if (valA === valB || valA === 'any' || valB === 'any') {
          lifestyleMatchCount += 1;
        }
      } else if (key === 'smoking') {
        // Mismatch is heavy (e.g. one smoker, one non-smoker)
        if (valA === valB) {
          lifestyleMatchCount += 1;
        }
      } else if (key === 'drinking' || key === 'pets' || key === 'guests') {
        if (valA === valB) {
          lifestyleMatchCount += 1;
        } else {
          lifestyleMatchCount += 0.5; // partial tolerance
        }
      } else if (key === 'cleanliness') {
        const stepA = getCleanlinessStep(valA);
        const stepB = getCleanlinessStep(valB);
        const diff = Math.abs(stepA - stepB);
        if (diff === 0) lifestyleMatchCount += 1;
        else if (diff === 1) lifestyleMatchCount += 0.5;
      } else if (key === 'noisePreference') {
        const stepA = getNoiseStep(valA);
        const stepB = getNoiseStep(valB);
        const diff = Math.abs(stepA - stepB);
        if (diff === 0) lifestyleMatchCount += 1;
        else if (diff === 1) lifestyleMatchCount += 0.5;
      } else if (key === 'socialLifestyle') {
        const stepA = getSocialStep(valA);
        const stepB = getSocialStep(valB);
        const diff = Math.abs(stepA - stepB);
        if (diff === 0) lifestyleMatchCount += 1;
        else if (diff === 1) lifestyleMatchCount += 0.5;
      } else if (key === 'workFromHome') {
        if (valA === valB) lifestyleMatchCount += 1;
        else lifestyleMatchCount += 0.75;
      } else {
        // Exact matching for sleepingSchedule, wakeUpTime, studyEnvironment
        if (valA === valB) {
          lifestyleMatchCount += 1;
        }
      }
    });

    const lifestyleScore = Math.round((lifestyleMatchCount / lifestyleKeys.length) * 35 * 10) / 10;

    // --- 4. Occupation Score (Max: 10) ---
    let occupationScore = 0;
    const occA = profileA.basicInfo?.occupation;
    const occB = profileB.basicInfo?.occupation;
    if (occA && occB) {
      if (occA === occB) {
        occupationScore = 10;
      } else {
        occupationScore = 5; // student vs professional is partially fine
      }
    }

    // --- 5. Language Score (Max: 10) ---
    let languageScore = 0;
    const langsA = (profileA.languagesSpoken || []).map((l) => l.toLowerCase().trim());
    const langsB = (profileB.languagesSpoken || []).map((l) => l.toLowerCase().trim());
    const sharedLangs = langsA.filter((lang) => langsB.includes(lang));

    if (sharedLangs.length > 0) {
      languageScore = 10;
    }

    // --- 6. Move-in Date Score (Max: 5) ---
    let moveInScore = 0;
    const dateA = profileA.moveInDate ? new Date(profileA.moveInDate) : null;
    const dateB = profileB.moveInDate ? new Date(profileB.moveInDate) : null;

    if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      const diffTime = Math.abs(dateA.getTime() - dateB.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 15) {
        moveInScore = 5;
      } else if (diffDays <= 30) {
        moveInScore = 4;
      } else if (diffDays <= 60) {
        moveInScore = 2;
      } else if (diffDays <= 90) {
        moveInScore = 1;
      }
    }

    const totalScore = Math.round(budgetScore + locationScore + lifestyleScore + occupationScore + languageScore + moveInScore);

    return {
      score: totalScore,
      breakdown: {
        budget: { score: budgetScore, max: 20 },
        location: { score: locationScore, max: 20 },
        lifestyle: { score: lifestyleScore, max: 35 },
        occupation: { score: occupationScore, max: 10 },
        language: { score: languageScore, max: 10 },
        moveInDate: { score: moveInScore, max: 5 },
      },
    };
  }
}

const compatibilityService = new CompatibilityService();
export default compatibilityService;
export { compatibilityService };
