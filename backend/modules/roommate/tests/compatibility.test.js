import compatibilityService from '../services/compatibilityService.js';

console.log('🧪 Running Roommate Compatibility Engine Tests...\n');

const profileA = {
  basicInfo: { occupation: 'student', gender: 'female' },
  lifestyle: {
    sleepingSchedule: 'early_bird',
    wakeUpTime: '06:00',
    foodPreference: 'veg',
    smoking: false,
    drinking: false,
    pets: false,
    guests: false,
    cleanliness: 'high',
    noisePreference: 'quiet',
    studyEnvironment: 'quiet',
    workFromHome: true,
    socialLifestyle: 'introvert'
  },
  budget: { monthlyRent: 6000, securityDeposit: 12000, propertyType: 'apartment', listingType: 'rent' },
  locationPreferences: { city: 'Noida', area: 'Sector 62', maxDistance: 5 },
  languagesSpoken: ['Hindi', 'English'],
  moveInDate: new Date('2026-08-01')
};

// 1. Exact match test (should be 100%)
const result1 = compatibilityService.calculateCompatibility(profileA, profileA);
console.log(`Test 1 (Exact Match): Score = ${result1.score}% (Expected: 100%)`);
if (result1.score !== 100) {
  console.error('❌ Mismatch in Test 1!');
  process.exit(1);
}

// 2. High match test (slight deviations)
const profileB = {
  ...profileA,
  lifestyle: {
    ...profileA.lifestyle,
    socialLifestyle: 'moderate' // partial match (adds 0.5/12 * 35% = 1.45% diff)
  },
  budget: {
    ...profileA.budget,
    monthlyRent: 6500 // slight difference within 15% (should still score 20)
  },
  moveInDate: new Date('2026-08-10') // within 15 days (should still score 5)
};

const result2 = compatibilityService.calculateCompatibility(profileA, profileB);
console.log(`Test 2 (High Similarity): Score = ${result2.score}% (Expected: ~98-99%)`);
if (result2.score < 95) {
  console.error('❌ Mismatch in Test 2!');
  process.exit(1);
}

// 3. Low match test (major deviations)
const profileC = {
  basicInfo: { occupation: 'professional', gender: 'male' },
  lifestyle: {
    sleepingSchedule: 'night_owl',
    wakeUpTime: '11:00',
    foodPreference: 'non-veg',
    smoking: true,
    drinking: true,
    pets: true,
    guests: true,
    cleanliness: 'low',
    noisePreference: 'loud',
    studyEnvironment: 'group',
    workFromHome: false,
    socialLifestyle: 'extrovert'
  },
  budget: { monthlyRent: 12000, securityDeposit: 24000, propertyType: 'villa', listingType: 'lease' },
  locationPreferences: { city: 'Delhi', area: 'Connaught Place', maxDistance: 15 },
  languagesSpoken: ['Spanish'],
  moveInDate: new Date('2026-11-20') // > 90 days (should score 0)
};

const result3 = compatibilityService.calculateCompatibility(profileA, profileC);
console.log(`Test 3 (Heavy Discrepancy): Score = ${result3.score}% (Expected: low)`);
if (result3.score > 30) {
  console.error('❌ Mismatch in Test 3!');
  process.exit(1);
}

console.log('\n✅ All Compatibility Engine Tests Passed successfully!');
process.exit(0);
