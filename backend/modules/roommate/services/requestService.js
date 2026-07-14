import roommateRequestRepository from '../repositories/roommateRequestRepository.js';
import roommateRepository from '../repositories/roommateRepository.js';
import compatibilityService from './compatibilityService.js';
import authEventEmitter from '../../../utils/eventEmitter.js';
import { ConflictError, ValidationError, NotFoundError, ForbiddenError } from '../../../utils/errors.js';

class RequestService {
  /**
   * Sends a roommate connection request from sender to receiver.
   */
  async sendRequest(senderId, receiverId, message = '') {
    if (String(senderId) === String(receiverId)) {
      throw new ValidationError('You cannot send a roommate request to yourself.');
    }

    // 1. Verify sender roommate profile exists
    const senderProfile = await roommateRepository.findByUserId(senderId);
    if (!senderProfile) {
      throw new NotFoundError('Please create a roommate profile first to send requests.');
    }

    // 2. Verify receiver roommate profile exists
    const receiverProfile = await roommateRepository.findByUserId(receiverId);
    if (!receiverProfile) {
      throw new NotFoundError('Target roommate profile not found.');
    }

    // 3. Check for existing request between the two users
    const existingRequest = await roommateRequestRepository.findActiveRequest(senderId, receiverId);

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new ConflictError('A connection request is already pending between you two.');
      }
      if (existingRequest.status === 'accepted') {
        throw new ConflictError('You are already connected as roommates.');
      }
      // If cancelled or rejected, we can reuse and update the status to pending
    }

    // 4. Create request
    const requestPayload = {
      senderId,
      receiverId,
      status: 'pending',
      message,
    };

    const request = await roommateRequestRepository.createRequest(requestPayload);

    // 5. Emit event
    authEventEmitter.emit('roommate.request.sent', {
      request,
      sender: senderProfile,
      receiver: receiverProfile,
    });

    return request;
  }

  /**
   * Accepts a pending connection request.
   */
  async acceptRequest(requestId, receiverId) {
    const request = await roommateRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Request not found.');
    }

    const targetReceiverId = request.receiverId._id || request.receiverId;
    if (String(targetReceiverId) !== String(receiverId)) {
      throw new ForbiddenError('You are not authorized to accept this request.');
    }

    if (request.status !== 'pending') {
      throw new ValidationError(`Cannot accept request that is already ${request.status}.`);
    }

    const updatedRequest = await roommateRequestRepository.updateStatus(requestId, 'accepted');

    // Emit event
    authEventEmitter.emit('roommate.request.accepted', {
      request: updatedRequest,
    });

    return updatedRequest;
  }

  /**
   * Rejects a pending connection request.
   */
  async rejectRequest(requestId, receiverId) {
    const request = await roommateRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Request not found.');
    }

    const targetReceiverId = request.receiverId._id || request.receiverId;
    if (String(targetReceiverId) !== String(receiverId)) {
      throw new ForbiddenError('You are not authorized to reject this request.');
    }

    if (request.status !== 'pending') {
      throw new ValidationError(`Cannot reject request that is already ${request.status}.`);
    }

    const updatedRequest = await roommateRequestRepository.updateStatus(requestId, 'rejected');

    // Emit event
    authEventEmitter.emit('roommate.request.rejected', {
      request: updatedRequest,
    });

    return updatedRequest;
  }

  /**
   * Cancels a pending request sent by the user.
   */
  async cancelRequest(requestId, senderId) {
    const request = await roommateRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Request not found.');
    }

    const targetSenderId = request.senderId._id || request.senderId;
    if (String(targetSenderId) !== String(senderId)) {
      throw new ForbiddenError('You are not authorized to cancel this request.');
    }

    if (request.status !== 'pending') {
      throw new ValidationError(`Cannot cancel request that is already ${request.status}.`);
    }

    return await roommateRequestRepository.updateStatus(requestId, 'cancelled');
  }

  /**
   * Removes an existing match connection.
   */
  async removeMatch(requestId, userId) {
    const request = await roommateRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Connection request not found.');
    }

    if (request.status !== 'accepted') {
      throw new ValidationError('You can only remove active connections.');
    }

    const sId = request.senderId._id || request.senderId;
    const rId = request.receiverId._id || request.receiverId;

    if (String(sId) !== String(userId) && String(rId) !== String(userId)) {
      throw new ForbiddenError('You are not authorized to modify this connection.');
    }

    // Set to cancelled/deleted so they can re-request if desired
    return await roommateRequestRepository.updateStatus(requestId, 'cancelled');
  }

  /**
   * Fetches roommate matches dashboard info.
   */
  async getMatchesDashboard(userId) {
    const allRequests = await roommateRequestRepository.getRequestsForUser(userId);

    const uid = String(userId);

    const pendingRequests = allRequests.filter(
      (r) => String(r.receiverId._id || r.receiverId) === uid && r.status === 'pending'
    );
    const sentRequests = allRequests.filter(
      (r) => String(r.senderId._id || r.senderId) === uid && r.status === 'pending'
    );
    const acceptedMatches = allRequests.filter((r) => r.status === 'accepted');
    const rejectedRequests = allRequests.filter(
      (r) => String(r.receiverId._id || r.receiverId) === uid && r.status === 'rejected'
    );

    // Recent activity log (e.g. last 5 updates)
    const recentActivity = [...allRequests].slice(0, 5);

    const currentUserProfile = await roommateRepository.findByUserId(userId);

    // Populate companion profile preview inside accepted matches
    const acceptedWithProfiles = await Promise.all(
      acceptedMatches.map(async (match) => {
        const matchObj = match.toObject ? match.toObject() : match;
        const senderVal = match.senderId._id || match.senderId;
        const receiverVal = match.receiverId._id || match.receiverId;
        const companionId = String(senderVal) === uid ? receiverVal : senderVal;
        const companionProfileRaw = await roommateRepository.findByUserId(companionId);
        
        let companionProfile = null;
        if (companionProfileRaw) {
          companionProfile = companionProfileRaw.toObject ? companionProfileRaw.toObject() : { ...companionProfileRaw };
          let compatibilityScore = 0;
          if (currentUserProfile) {
            const compat = compatibilityService.calculateCompatibility(currentUserProfile, companionProfile);
            compatibilityScore = compat.score;
          }
          companionProfile.compatibilityScore = compatibilityScore;
        }

        return {
          ...matchObj,
          companionProfile,
        };
      })
    );

    // Populate profiles for pending requests
    const pendingWithProfiles = await Promise.all(
      pendingRequests.map(async (req) => {
        const reqObj = req.toObject ? req.toObject() : req;
        const senderVal = req.senderId._id || req.senderId;
        const senderProfile = await roommateRepository.findByUserId(senderVal);
        return {
          ...reqObj,
          senderProfile,
        };
      })
    );

    const sentWithProfiles = await Promise.all(
      sentRequests.map(async (req) => {
        const reqObj = req.toObject ? req.toObject() : req;
        const receiverVal = req.receiverId._id || req.receiverId;
        const receiverProfile = await roommateRepository.findByUserId(receiverVal);
        return {
          ...reqObj,
          receiverProfile,
        };
      })
    );

    let matchCompatibility = 0;
    if (acceptedWithProfiles.length > 0) {
      const totalScore = acceptedWithProfiles.reduce((acc, m) => acc + (m.companionProfile?.compatibilityScore || 0), 0);
      matchCompatibility = Math.round(totalScore / acceptedWithProfiles.length);
    }

    return {
      stats: {
        totalMatches: acceptedMatches.length,
        pendingReceived: pendingRequests.length,
        pendingSent: sentRequests.length,
        rejectedReceived: rejectedRequests.length,
        matchCompatibility: matchCompatibility,
      },
      pendingRequests: pendingWithProfiles,
      sentRequests: sentWithProfiles,
      acceptedMatches: acceptedWithProfiles,
      rejectedRequests,
      recentActivity,
    };
  }
}

const requestService = new RequestService();
export default requestService;
export { requestService };
