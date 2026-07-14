import authEventEmitter from '../../../utils/eventEmitter.js';
import { logAction } from '../../../utils/auditLogger.js';
import chatService from '../../chat/services/chatService.js';

/**
 * Register all Roommate matching system event handlers
 */
export const registerRoommateEventHandlers = () => {
  // 1. Profile Created
  authEventEmitter.on('roommate.profile.created', async ({ profile }) => {
    try {
      await logAction({
        userId: profile.userId,
        action: 'ROOMMATE_PROFILE_CREATE',
        status: 'success',
        details: { roommateId: profile._id },
      });
    } catch (err) {
      console.error('Error in roommate.profile.created handler:', err.message);
    }
  });

  // 2. Profile Updated
  authEventEmitter.on('roommate.profile.updated', async ({ profile }) => {
    try {
      await logAction({
        userId: profile.userId,
        action: 'ROOMMATE_PROFILE_UPDATE',
        status: 'success',
        details: { roommateId: profile._id },
      });
    } catch (err) {
      console.error('Error in roommate.profile.updated handler:', err.message);
    }
  });

  // 3. Request Sent
  authEventEmitter.on('roommate.request.sent', async ({ request, sender, receiver }) => {
    try {
      await logAction({
        userId: request.senderId,
        action: 'ROOMMATE_REQUEST_SEND',
        status: 'success',
        details: { requestId: request._id, receiverId: request.receiverId },
      });
    } catch (err) {
      console.error('Error in roommate.request.sent handler:', err.message);
    }
  });

  // 4. Request Accepted
  authEventEmitter.on('roommate.request.accepted', async ({ request }) => {
    try {
      // Log for receiver who accepted
      await logAction({
        userId: request.receiverId,
        action: 'ROOMMATE_REQUEST_ACCEPT',
        status: 'success',
        details: { requestId: request._id, partnerId: request.senderId },
      });

      // Log for sender as well
      await logAction({
        userId: request.senderId,
        action: 'ROOMMATE_MATCH_ESTABLISHED',
        status: 'success',
        details: { requestId: request._id, partnerId: request.receiverId },
      });

      // Automatically create a roommate conversation thread
      const sId = request.senderId._id || request.senderId;
      const rId = request.receiverId._id || request.receiverId;
      
      const conv = await chatService.getOrCreateConversation(
        'roommate',
        sId, // Using sender ID as contextId
        'User',
        [sId, rId]
      );
      
      // Post system announcement message
      await chatService.sendSystemMessage(
        conv._id,
        'Roommate request accepted! You can now start messaging each other.'
      );
    } catch (err) {
      console.error('Error in roommate.request.accepted handler:', err.message);
    }
  });

  // 5. Request Rejected
  authEventEmitter.on('roommate.request.rejected', async ({ request }) => {
    try {
      await logAction({
        userId: request.receiverId,
        action: 'ROOMMATE_REQUEST_REJECT',
        status: 'success',
        details: { requestId: request._id, senderId: request.senderId },
      });
    } catch (err) {
      console.error('Error in roommate.request.rejected handler:', err.message);
    }
  });

  // 6. Profile Reported
  authEventEmitter.on('roommate.profile.reported', async ({ report }) => {
    try {
      await logAction({
        userId: report.reporterId,
        action: 'ROOMMATE_PROFILE_REPORT',
        status: 'success',
        details: { reportId: report._id, roommateId: report.roommateId, reason: report.reason },
      });
    } catch (err) {
      console.error('Error in roommate.profile.reported handler:', err.message);
    }
  });
};

export default registerRoommateEventHandlers;
