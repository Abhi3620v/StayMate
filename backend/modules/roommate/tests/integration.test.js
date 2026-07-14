import roommateService from '../services/roommateService.js';
import matchService from '../services/matchService.js';
import requestService from '../services/requestService.js';
import roommateRepository from '../repositories/roommateRepository.js';
import roommateRequestRepository from '../repositories/roommateRequestRepository.js';
import { mockUsers } from '../../../config/inMemoryDb.js';

async function runIntegrationTests() {
  console.log('🧪 Starting End-to-End Roommate Matching Integration Tests...\n');

  // 1. Define mock users
  const tenantAId = 'mock_tenant_id_123'; // Pre-seeded tenant user
  const tenantBId = 'mock_tenant_b_id';
  
  // Register tenant B in mock database
  mockUsers.push({
    _id: tenantBId,
    name: 'Jane Doe',
    email: 'jane@staymate.com',
    role: 'tenant',
    status: 'active'
  });

  console.log('✔ Seeded mock users successfully.');

  // 2. Define profile payloads
  const profileAPayload = {
    basicInfo: {
      occupation: 'student',
      collegeOrCompany: 'IIT Delhi',
      age: 21,
      gender: 'male',
      bio: 'Quiet and focused computer science student looking for a neat roommate.'
    },
    lifestyle: {
      sleepingSchedule: 'early_bird',
      wakeUpTime: '06:30 AM',
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
    budget: {
      monthlyRent: 7000,
      securityDeposit: 14000,
      propertyType: 'apartment',
      listingType: 'shared'
    },
    locationPreferences: {
      city: 'Noida',
      area: 'Sector 62',
      maxDistance: 5
    },
    languagesSpoken: ['English', 'Hindi'],
    hobbies: ['Coding', 'Chess'],
    interests: ['AI', 'Tech'],
    moveInDate: '2026-08-01',
    maxRoommates: 1,
    visibility: 'public'
  };

  const profileBPayload = {
    basicInfo: {
      occupation: 'student',
      collegeOrCompany: 'IIT Delhi',
      age: 22,
      gender: 'female',
      bio: 'Design student. Keep shared areas tidy and clean.'
    },
    lifestyle: {
      sleepingSchedule: 'flexible',
      wakeUpTime: '08:00 AM',
      foodPreference: 'veg',
      smoking: false,
      drinking: false,
      pets: false,
      guests: true, // minor difference
      cleanliness: 'high',
      noisePreference: 'quiet',
      studyEnvironment: 'quiet',
      workFromHome: false, // minor difference
      socialLifestyle: 'moderate' // minor difference
    },
    budget: {
      monthlyRent: 7500, // slight difference within 15% range
      securityDeposit: 15000,
      propertyType: 'apartment',
      listingType: 'shared'
    },
    locationPreferences: {
      city: 'Noida',
      area: 'Sector 62',
      maxDistance: 10
    },
    languagesSpoken: ['Hindi', 'English'],
    hobbies: ['Painting', 'Cooking'],
    interests: ['Design', 'Art'],
    moveInDate: '2026-08-10', // within 15 days
    maxRoommates: 1,
    visibility: 'public'
  };

  // 3. Create Profiles
  console.log('\n--- PROFILE CREATION ---');
  const profileA = await roommateService.createProfile(tenantAId, profileAPayload);
  const profileB = await roommateService.createProfile(tenantBId, profileBPayload);
  
  console.log(`✔ Profile A created. Completeness: ${profileA.completionPercentage}%`);
  console.log(`✔ Profile B created. Completeness: ${profileB.completionPercentage}%`);
  
  if (profileA.completionPercentage < 80 || profileB.completionPercentage < 80) {
    throw new Error('❌ Completeness calculation under-calculated!');
  }

  // 4. Discovery Feed & Compatibility Scoring
  console.log('\n--- DISCOVERY & FILTERING ---');
  const feedResult = await matchService.discoverMatches(tenantAId, {
    city: 'Noida',
    maxRent: 8000,
    minCompatibility: 70
  });

  console.log(`✔ Discovery returned ${feedResult.data.length} matches.`);
  if (feedResult.data.length === 0) {
    throw new Error('❌ Matching profiles not found in discovery!');
  }

  const match = feedResult.data[0];
  console.log(`✔ Match profile name: ${match.userId?.name}`);
  console.log(`✔ Compatibility Score between A and B: ${match.compatibilityScore}%`);
  if (match.compatibilityScore < 85) {
    throw new Error('❌ Compatibility score returned lower than expected threshold!');
  }

  // 5. Connection Request Workflow
  console.log('\n--- REQUEST WORKFLOW ---');
  // Send request
  const request = await requestService.sendRequest(tenantAId, tenantBId, 'Hey, let us connect!');
  console.log(`✔ Connection request sent. ID: ${request._id} | Status: ${request.status}`);

  // Fetch Dashboard (A)
  let dashboardA = await requestService.getMatchesDashboard(tenantAId);
  console.log(`✔ Tenant A dashboard: sent requests count = ${dashboardA.stats.pendingSent}`);
  if (dashboardA.stats.pendingSent !== 1) {
    throw new Error('❌ Pending sent request count is incorrect.');
  }

  // Fetch Dashboard (B)
  let dashboardB = await requestService.getMatchesDashboard(tenantBId);
  console.log(`✔ Tenant B dashboard: received requests count = ${dashboardB.stats.pendingReceived}`);
  if (dashboardB.stats.pendingReceived !== 1) {
    throw new Error('❌ Pending received request count is incorrect.');
  }

  // Accept request by B
  await requestService.acceptRequest(request._id, tenantBId);
  console.log(`✔ Connection request accepted by B.`);

  // Verify match exists on dashboards
  dashboardA = await requestService.getMatchesDashboard(tenantAId);
  dashboardB = await requestService.getMatchesDashboard(tenantBId);
  console.log(`✔ Matches count for A: ${dashboardA.stats.totalMatches}`);
  console.log(`✔ Matches count for B: ${dashboardB.stats.totalMatches}`);

  if (dashboardA.stats.totalMatches !== 1 || dashboardB.stats.totalMatches !== 1) {
    throw new Error('❌ Matches failed to establish after acceptance.');
  }

  // 6. Favorites & History Logs
  console.log('\n--- FAVORITES & LOGS ---');
  // Toggle Favorite
  const favResult = await roommateService.toggleFavorite(tenantAId, profileB._id);
  console.log(`✔ Toggled favorite status: ${favResult.isFavorite ? 'Saved' : 'Removed'}`);
  
  const favorites = await roommateService.getFavorites(tenantAId);
  console.log(`✔ Tenant A saved roommates count: ${favorites.length}`);
  if (favorites.length !== 1) {
    throw new Error('❌ Favorite profile failed to log.');
  }

  // Log View History
  await roommateService.getProfileById(profileB._id, tenantAId);
  const views = await roommateService.getRecentViews(tenantAId);
  console.log(`✔ Tenant A recently viewed count: ${views.length}`);
  if (views.length !== 1) {
    throw new Error('❌ Profile view failed to log in history.');
  }

  // 7. Safety Reports & Flags
  console.log('\n--- REPORTS & MODERATION ---');
  const report = await roommateService.reportProfile(tenantAId, {
    roommateId: profileB._id,
    reason: 'Spam',
    description: 'Sending duplicate spam messages.'
  });
  console.log(`✔ Safety report created. ID: ${report._id} | Reason: ${report.reason}`);

  // Fetch admin reports queue
  const adminReports = await roommateService.getReports();
  console.log(`✔ Admin open reports queue count: ${adminReports.length}`);
  if (adminReports.length !== 1) {
    throw new Error('❌ Report failed to log in moderation queue.');
  }

  // Admin resolves report
  await roommateService.resolveReport(report._id, 'mock_admin_id', {
    status: 'resolved',
    resolutionNotes: 'Spam account reviewed and warning issued.'
  });
  console.log(`✔ Admin resolved report successfully.`);

  console.log('\n======================================================');
  console.log('✅ ALL INTEGRATION TESTS PASSED PERFECTLY!');
  console.log('======================================================\n');
  process.exit(0);
}

runIntegrationTests().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
  process.exit(1);
});
