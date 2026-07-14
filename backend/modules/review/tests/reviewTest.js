import mongoose from 'mongoose';
import reviewService from '../services/reviewService.js';
import reviewRepository from '../repositories/reviewRepository.js';
import reputationService from '../services/reputationService.js';
import { isDbConnected, mockVisitRequests, mockUsers } from '../../../config/inMemoryDb.js';
import VisitRequest from '../../../models/VisitRequest.js';
import User from '../../../models/User.js';
import Property from '../../../models/Property.js';
import RoommateRequest from '../../../models/RoommateRequest.js';

async function runTests() {
  console.log('--- STARTING REVIEW MODULE TESTS ---');
  console.log('Database Connected Status:', isDbConnected());

  // Reset repositories mock caches
  reviewRepository.clearMock();

  // Test identifiers
  const tenantId = '507f1f77bcf86cd7994390a1';
  const ownerId = '507f1f77bcf86cd7994390a2';
  const propertyId = '507f1f77bcf86cd7994390a3';
  const visitId = '507f1f77bcf86cd7994390a4';
  const roommateId = '507f1f77bcf86cd7994390a5';
  const matchId = '507f1f77bcf86cd7994390a6';

  // Seed verified interaction mock / db data
  if (isDbConnected()) {
    // Clean up previous test runs if database connected
    await mongoose.connection.db.dropDatabase();
    
    // Create users, property, visit, and roommate requests in Mongoose
    await User.create({ _id: tenantId, name: 'Test Tenant', email: 'tenant@test.com', password: 'password123', role: 'tenant', status: 'active' });
    await User.create({ _id: ownerId, name: 'Test Owner', email: 'owner@test.com', password: 'password123', role: 'owner', status: 'active' });
    await User.create({ _id: roommateId, name: 'Test Roommate', email: 'roommate@test.com', password: 'password123', role: 'tenant', status: 'active' });
    await Property.create({ _id: propertyId, ownerId, title: 'Beautiful Apt', description: 'Lovely stay', propertyType: 'flat', listingType: 'rent', location: { state: 'Delhi', city: 'Noida', area: 'Sector 62', pinCode: '201301' }, pricing: { monthlyRent: 12000 }, roomDetails: { bedrooms: 2, bathrooms: 2 }, status: 'published' });
    await VisitRequest.create({ _id: visitId, propertyId, tenantId, ownerId, date: new Date(), time: '14:00', status: 'accepted' });
    await RoommateRequest.create({ _id: matchId, senderId: tenantId, receiverId: roommateId, status: 'accepted' });
  } else {
    // Seed inMemoryDb arrays
    mockUsers.push({ _id: tenantId, name: 'Test Tenant', role: 'tenant', status: 'active' });
    mockUsers.push({ _id: ownerId, name: 'Test Owner', role: 'owner', status: 'active' });
    mockUsers.push({ _id: roommateId, name: 'Test Roommate', role: 'tenant', status: 'active' });

    mockVisitRequests.push({
      _id: visitId,
      tenantId,
      propertyId,
      ownerId,
      status: 'accepted'
    });
  }

  // Test 1: Try review without verified visit (Eligibility Gating)
  console.log('\nTest 1: Verifying review eligibility gating...');
  try {
    await reviewService.createReview(tenantId, {
      category: 'property',
      propertyId,
      visitId: '507f1f77bcf86cd7994390ff', // Wrong visit ID
      rating: 4,
      ratings: { Cleanliness: 4, Safety: 5 },
      content: 'Should fail validation'
    });
    console.error('✗ FAIL: Reviewed property without verified visit request!');
  } catch (error) {
    console.log('✓ Success: Correctly rejected review. Error:', error.message);
  }

  // Test 2: Create valid property review
  console.log('\nTest 2: Creating a valid property review...');
  const review = await reviewService.createReview(tenantId, {
    category: 'property',
    propertyId,
    visitId,
    rating: 5,
    ratings: { Cleanliness: 5, Safety: 5, Location: 4, Amenities: 4, ValueForMoney: 5, Maintenance: 5 },
    title: 'Outstanding Flat!',
    content: 'Very clean place with amazing host. Recommended!',
    images: [{ url: 'https://images.com/apt.jpg', caption: 'Living room' }],
    recommend: true
  });
  console.log('✓ Property review created successfully. ID:', review._id);
  console.log('  Rating:', review.rating, 'Content:', review.content);

  // Test 3: Duplicate review prevention
  console.log('\nTest 3: Testing duplicate review prevention...');
  try {
    await reviewService.createReview(tenantId, {
      category: 'property',
      propertyId,
      visitId,
      rating: 3,
      content: 'Trying to duplicate review'
    });
    console.error('✗ FAIL: Allowed duplicate review for same visit interaction!');
  } catch (error) {
    console.log('✓ Success: Duplicate review blocked. Error:', error.message);
  }

  // Test 4: Dynamic Reputation Score calculations
  console.log('\nTest 4: Evaluating dynamic reputation score...');
  let rep = await reputationService.calculateUserReputation(ownerId);
  console.log(`✓ Owner Reputation: Score: ${rep.score}/100, Level: ${rep.level}`);
  console.log('  Breakdown:', rep.breakdown);

  // Test 5: Owner reply to review
  console.log('\nTest 5: Adding owner reply to property review...');
  const updatedReview = await reviewService.addReply(review._id, ownerId, 'Thank you for your kind feedback!');
  console.log('✓ Reply registered successfully.');
  console.log('  Reply:', updatedReview.reply.content);

  // Test 6: Non-owner reply block (Security check)
  console.log('\nTest 6: Verifying reply security blocks...');
  try {
    await reviewService.addReply(review._id, roommateId, 'Sneaking a reply');
    console.error('✗ FAIL: Allowed unauthorized user to reply to property review!');
  } catch (error) {
    console.log('✓ Success: Blocked unauthorized reply. Error:', error.message);
  }

  // Test 7: Helpful voting
  console.log('\nTest 7: Testing helpful votes toggle...');
  let voted = await reviewService.voteHelpful(review._id, roommateId, 'helpful');
  console.log('✓ Vote cast. Helpful Count:', voted.helpfulCount);
  
  // Toggling same vote should remove it
  voted = await reviewService.voteHelpful(review._id, roommateId, 'helpful');
  console.log('✓ Vote toggled again. Helpful Count:', voted.helpfulCount);

  // Test 8: Reporting review
  console.log('\nTest 8: Reporting review for inappropriate content...');
  const flagged = await reviewService.reportReview(review._id, roommateId, 'harassment', 'Offensive wording');
  console.log('✓ Review flagged successfully. Review Status:', flagged.status);
  console.log('  Reports Count:', flagged.reports.length);

  // Test 9: Admin resolving report
  console.log('\nTest 9: Admin resolving review report...');
  const reportId = flagged.reports[0]._id || roommateId;
  await reviewService.resolveReport(review._id, reportId, 'resolved');
  const resolvedReview = await reviewRepository.findById(review._id);
  console.log('✓ Report marked as resolved. Review Status:', resolvedReview.status);

  console.log('\n--- ALL REVIEW MODULE TESTS COMPLETED SUCCESSFULLY ---');
}

// Check if run directly
if (process.argv[1] && process.argv[1].endsWith('reviewTest.js')) {
  if (isDbConnected()) {
    mongoose.connect('mongodb://127.0.0.1:27017/staymate')
      .then(() => runTests())
      .then(() => mongoose.disconnect())
      .catch(console.error);
  } else {
    runTests().catch(console.error);
  }
}

export default runTests;
