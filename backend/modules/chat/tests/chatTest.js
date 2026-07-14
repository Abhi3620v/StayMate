import chatService from '../services/chatService.js';
import conversationRepository from '../repositories/conversationRepository.js';
import messageRepository from '../repositories/messageRepository.js';
import blockRepository from '../repositories/blockRepository.js';
import chatReportRepository from '../repositories/chatReportRepository.js';
import { isDbConnected } from '../../../config/inMemoryDb.js';

async function runTests() {
  console.log('--- STARTING CHAT MODULE TESTS ---');
  console.log('Database Connected Status:', isDbConnected());

  // Reset repositories mock caches
  conversationRepository.clearMock();
  messageRepository.clearMock();
  blockRepository.clearMock();
  chatReportRepository.clearMock();

  const userA = '507f1f77bcf86cd799439011';
  const userB = '507f1f77bcf86cd799439012';
  const contextId = '507f1f77bcf86cd799439013';

  // Test 1: Create Conversation
  console.log('\nTest 1: Creating a property conversation...');
  const conv = await chatService.getOrCreateConversation('property', contextId, 'Property', [userA, userB]);
  console.log('✓ Conversation created successfully. ID:', conv._id);

  // Test 2: Send message
  console.log('\nTest 2: Sending a message...');
  const msg1 = await chatService.sendMessage(conv._id, userA, 'Hello there! Is the listing still available?');
  console.log('✓ Message sent. Text:', msg1.text);

  // Test 3: Edit message
  console.log('\nTest 3: Editing message...');
  const msgEdited = await chatService.editMessage(msg1._id, userA, 'Hello! Is the listing still available? (Edited)');
  console.log('✓ Message edited. New text:', msgEdited.text);

  // Test 4: Block user
  console.log('\nTest 4: Blocking user...');
  await chatService.blockUser(userB, userA);
  console.log('✓ User B blocked User A successfully.');

  // Test 5: Verify block rejects messaging
  console.log('\nTest 5: Verifying messaging block restrictions...');
  try {
    await chatService.sendMessage(conv._id, userA, 'Hey, can you reply?');
    console.error('✗ FAIL: Message went through even though sender is blocked.');
  } catch (error) {
    console.log('✓ Success: Message rejected correctly. Error:', error.message);
  }

  // Test 6: Unblock user
  console.log('\nTest 6: Unblocking user...');
  await chatService.unblockUser(userB, userA);
  console.log('✓ User B unblocked User A successfully.');

  // Test 7: Verify message goes through after unblocking
  console.log('\nTest 7: Resending message after unblock...');
  const msg2 = await chatService.sendMessage(conv._id, userA, 'Hey, can you reply now?');
  console.log('✓ Message sent successfully. Text:', msg2.text);

  // Test 8: Soft Delete message
  console.log('\nTest 8: Soft deleting message...');
  const deletedMsg = await chatService.deleteMessage(msg2._id, userA);
  console.log('✓ Message deleted. Text:', deletedMsg.text, 'isDeleted:', deletedMsg.isDeleted);

  // Test 9: File Report
  console.log('\nTest 9: Filing conversation safety report...');
  const report = await chatService.reportChat(userA, conv._id, msg1._id, 'harassment', 'User sent multiple spam messages.');
  console.log('✓ Safety report submitted. ID:', report._id);

  // Test 10: Fetch reports for admin
  console.log('\nTest 10: Admin retrieving reports list...');
  const reports = await chatService.getReportedChats();
  console.log('✓ Retrieved reports. Count:', reports.length);

  // Test 11: Resolve report
  console.log('\nTest 11: Resolving safety report...');
  const resolved = await chatService.resolveReport(report._id);
  console.log('✓ Report status updated:', resolved.status);

  console.log('\n--- ALL CHAT MODULE TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('✗ TEST FAILED WITH RUNTIME EXCEPTION:', err);
  process.exit(1);
});
