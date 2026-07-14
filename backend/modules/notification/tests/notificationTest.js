import mongoose from 'mongoose';
import notificationService from '../services/notificationService.js';
import notificationRepository, { mockNotifications, mockPreferences } from '../repositories/notificationRepository.js';
import { isDbConnected, mockUsers } from '../../../config/inMemoryDb.js';

// Setup Mock User for local testing
const testRecipientId = new mongoose.Types.ObjectId().toString();
const testActorId = new mongoose.Types.ObjectId().toString();
const testRefId = new mongoose.Types.ObjectId().toString();

mockUsers.push({
  _id: testRecipientId,
  name: 'John Doe',
  email: 'john.doe@test.com',
  isVerified: true
});

mockUsers.push({
  _id: testActorId,
  name: 'Mike Seeker',
  email: 'mike.seeker@test.com',
  isVerified: true
});

async function runTests() {
  console.log('🚀 [STARTING NOTIFICATIONS TEST SUITE]');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      passed++;
      console.log(`  ✓ [PASS] ${message}`);
    } else {
      failed++;
      console.error(`  ❌ [FAIL] ${message}`);
    }
  };

  try {
    // -------------------------------------------------------------
    // Test 1: Preference Default Values
    // -------------------------------------------------------------
    const initialPrefs = await notificationRepository.getPreferences(testRecipientId);
    assert(initialPrefs !== null, 'Should return preference defaults for new user');
    assert(initialPrefs.categories.property.inApp === true, 'Property inApp default should be true');
    assert(initialPrefs.categories.property.email === true, 'Property email default should be true');

    // -------------------------------------------------------------
    // Test 2: Update Preferences Settings
    // -------------------------------------------------------------
    await notificationRepository.updatePreferences(testRecipientId, {
      categories: {
        property: { inApp: true, email: false } // disable email alerts
      }
    });

    const updatedPrefs = await notificationRepository.getPreferences(testRecipientId);
    assert(updatedPrefs.categories.property.email === false, 'Should correctly toggle property email to false');
    assert(updatedPrefs.categories.property.inApp === true, 'Property inApp should remain true');

    // Reset back for subsequent tests
    await notificationRepository.updatePreferences(testRecipientId, {
      categories: {
        property: { inApp: true, email: true }
      }
    });

    // -------------------------------------------------------------
    // Test 3: Create Single Notification
    // -------------------------------------------------------------
    // Clear notifications array
    mockNotifications.length = 0;

    const notif = await notificationService.createNotification({
      recipientId: testRecipientId,
      actorId: testActorId,
      notificationType: 'visit_requested',
      title: 'New Visit Tour Requested',
      message: 'A seeker wants to view your property',
      category: 'visit',
      priority: 'high',
      referenceType: 'VisitRequest',
      referenceId: testRefId
    });

    assert(notif !== null, 'Notification creation should return notification object');
    assert(mockNotifications.length === 1, 'In-memory array size should be 1');
    assert(mockNotifications[0].readStatus === false, 'Notification should be unread by default');
    assert(mockNotifications[0].title === 'New Visit Tour Requested', 'Should match compose title');

    // -------------------------------------------------------------
    // Test 4: Unread Count Tracker
    // -------------------------------------------------------------
    const countRes = await notificationRepository.find({ recipientId: testRecipientId, readStatus: false, archivedStatus: false, softDeleted: false });
    assert(countRes.total === 1, 'Unread count should return 1');

    // -------------------------------------------------------------
    // Test 5: Notification Grouping
    // -------------------------------------------------------------
    // Emit second similar view notification for same recipient, same ref, same type, today
    const actor2Id = new mongoose.Types.ObjectId().toString();
    mockUsers.push({ _id: actor2Id, name: 'Alice Seeker', email: 'alice@test.com', isVerified: true });

    await notificationService.createNotification({
      recipientId: testRecipientId,
      actorId: actor2Id,
      notificationType: 'visit_requested',
      title: 'New Visit Tour Requested',
      message: 'A seeker wants to view your property',
      category: 'visit',
      priority: 'high',
      referenceType: 'VisitRequest',
      referenceId: testRefId
    });

    assert(mockNotifications.length === 1, 'Grouped notification should not create a second document');
    assert(mockNotifications[0].metadata?.groupedCount === 2, 'Grouped count in metadata should increment to 2');
    assert(mockNotifications[0].title === '2 updates: New Visit Tour Requested', 'Title should reflect grouped updates count');

    // -------------------------------------------------------------
    // Test 6: Mark Read Toggles
    // -------------------------------------------------------------
    await notificationRepository.updateMany(
      { _id: mockNotifications[0]._id, recipientId: testRecipientId },
      { readStatus: true }
    );

    const checkRead = await notificationRepository.findById(mockNotifications[0]._id);
    assert(checkRead.readStatus === true, 'Notification should be successfully marked read');

    const newUnread = await notificationRepository.find({ recipientId: testRecipientId, readStatus: false });
    assert(newUnread.total === 0, 'Unread count should now be 0');

    // -------------------------------------------------------------
    // Test 7: Admin Broadcast announcement
    // -------------------------------------------------------------
    mockNotifications.length = 0;
    const broadcastResult = await notificationService.broadcastAnnouncement({
      title: 'System Maintenance Upgrade',
      message: 'Platform will undergo maintenance tomorrow at 3AM.'
    });

    assert(broadcastResult.successCount > 0, 'Should successfully dispatch announcements');
    assert(mockNotifications.length === mockUsers.length, 'Announcement copies should equal total users count');
    assert(mockNotifications[0].category === 'admin', 'Announcements category should be admin');
    assert(mockNotifications[0].title === 'System Maintenance Upgrade', 'Announcement titles should match');

  } catch (err) {
    console.error('❌ Integration Test Suite Exception:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`[TESTS COMPLETED] Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
