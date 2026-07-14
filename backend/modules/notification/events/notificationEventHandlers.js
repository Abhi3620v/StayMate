import authEventEmitter from '../../../utils/eventEmitter.js';
import notificationService from '../services/notificationService.js';

export const registerNotificationEventHandlers = () => {
  // ========================================================
  // AUTHENTICATION EVENTS
  // ========================================================

  // 1. Password Changed
  authEventEmitter.on('password:changed', async ({ user }) => {
    try {
      await notificationService.createNotification({
        recipientId: user._id,
        notificationType: 'password_changed',
        title: 'Password Changed',
        message: 'Your account password was successfully updated.',
        description: 'All other active device sessions have been logged out for security.',
        category: 'auth',
        priority: 'high',
        icon: 'key',
        actionUrl: '/notifications'
      });
    } catch (err) {
      console.error('Error in notification password:changed handler:', err.message);
    }
  });

  // 2. Email Verified
  authEventEmitter.on('email:verified', async ({ user }) => {
    try {
      await notificationService.createNotification({
        recipientId: user._id,
        notificationType: 'email_verified',
        title: 'Email Verified Successfully',
        message: 'Your email address has been verified.',
        description: 'You now have full search and booking clearance on StayMate.',
        category: 'auth',
        priority: 'medium',
        icon: 'check-circle',
        actionUrl: '/notifications'
      });
    } catch (err) {
      console.error('Error in notification email:verified handler:', err.message);
    }
  });

  // 3. New Login Alert
  authEventEmitter.on('user:logged-in', async ({ user, req }) => {
    try {
      await notificationService.createNotification({
        recipientId: user._id,
        notificationType: 'new_login',
        title: 'New Account Login',
        message: 'A new login session was registered on your account.',
        description: 'If this was not you, please immediately update your credentials and terminate sessions.',
        category: 'auth',
        priority: 'high',
        icon: 'shield-alert',
        actionUrl: '/notifications'
      });
    } catch (err) {
      console.error('Error in notification user:logged-in handler:', err.message);
    }
  });

  // ========================================================
  // ROOMMATE EVENTS
  // ========================================================

  // 1. Match Request Sent
  authEventEmitter.on('roommate.request.sent', async ({ request }) => {
    try {
      await notificationService.createNotification({
        recipientId: request.receiverId,
        actorId: request.senderId,
        notificationType: 'roommate_request_sent',
        title: 'New Roommate Request',
        message: 'A seeker has sent you a roommate compatibility match request.',
        category: 'roommate',
        priority: 'medium',
        icon: 'user-plus',
        referenceType: 'RoommateRequest',
        referenceId: request._id,
        actionUrl: '/roommates/dashboard'
      });
    } catch (err) {
      console.error('Error in roommate.request.sent notification handler:', err.message);
    }
  });

  // 2. Match Request Accepted
  authEventEmitter.on('roommate.request.accepted', async ({ request }) => {
    try {
      await notificationService.createNotification({
        recipientId: request.senderId,
        actorId: request.receiverId,
        notificationType: 'roommate_request_accepted',
        title: 'Roommate Request Accepted!',
        message: 'Your roommate match request was accepted.',
        description: 'You can now chat with your new roommate match in the messaging console.',
        category: 'roommate',
        priority: 'high',
        icon: 'user-check',
        referenceType: 'RoommateRequest',
        referenceId: request._id,
        actionUrl: '/roommates/dashboard'
      });
    } catch (err) {
      console.error('Error in roommate.request.accepted notification handler:', err.message);
    }
  });

  // 3. Match Request Rejected
  authEventEmitter.on('roommate.request.rejected', async ({ request }) => {
    try {
      await notificationService.createNotification({
        recipientId: request.senderId,
        actorId: request.receiverId,
        notificationType: 'roommate_request_rejected',
        title: 'Roommate Request Declined',
        message: 'Your roommate match request was declined.',
        category: 'roommate',
        priority: 'low',
        icon: 'user-x',
        referenceType: 'RoommateRequest',
        referenceId: request._id,
        actionUrl: '/roommates/dashboard'
      });
    } catch (err) {
      console.error('Error in roommate.request.rejected notification handler:', err.message);
    }
  });

  // ========================================================
  // PROPERTY MODERATION EVENTS
  // ========================================================

  // 1. Property Published
  authEventEmitter.on('published', async (property) => {
    try {
      await notificationService.createNotification({
        recipientId: property.ownerId,
        notificationType: 'property_published',
        title: 'Property Published',
        message: `Your property listing "${property.title}" is now published and visible to seekers.`,
        category: 'property',
        priority: 'medium',
        icon: 'home',
        referenceType: 'Property',
        referenceId: property._id,
        actionUrl: `/properties/${property._id}`
      });
    } catch (err) {
      console.error('Error in property published notification handler:', err.message);
    }
  });

  // 2. Property Approved
  authEventEmitter.on('property:approved', async ({ property, notes }) => {
    try {
      await notificationService.createNotification({
        recipientId: property.ownerId,
        notificationType: 'property_approved',
        title: 'Listing Approved',
        message: `Your listing "${property.title}" was approved by platform moderation.`,
        description: notes || 'Listing matches community guidelines.',
        category: 'property',
        priority: 'high',
        icon: 'check-circle',
        referenceType: 'Property',
        referenceId: property._id,
        actionUrl: `/properties/${property._id}`
      });
    } catch (err) {
      console.error('Error in property approved notification handler:', err.message);
    }
  });

  // 3. Property Rejected
  authEventEmitter.on('property:rejected', async ({ property, reason, notes }) => {
    try {
      await notificationService.createNotification({
        recipientId: property.ownerId,
        notificationType: 'property_rejected',
        title: 'Listing Rejected',
        message: `Your listing "${property.title}" was rejected by platform moderation.`,
        description: `Reason: ${reason}. Notes: ${notes}`,
        category: 'property',
        priority: 'high',
        icon: 'triangle-alert',
        referenceType: 'Property',
        referenceId: property._id,
        actionUrl: '/owner/properties'
      });
    } catch (err) {
      console.error('Error in property rejected notification handler:', err.message);
    }
  });

  // ========================================================
  // VISIT BOOKING EVENTS
  // ========================================================

  // 1. Visit Tour Requested
  authEventEmitter.on('visit:requested', async ({ visit }) => {
    try {
      await notificationService.createNotification({
        recipientId: visit.ownerId,
        actorId: visit.tenantId,
        notificationType: 'visit_requested',
        title: 'New Visit Requested',
        message: 'A seeker has requested a scheduled tour of your property.',
        description: `Proposed Date: ${new Date(visit.date).toLocaleDateString()}. Time: ${visit.time}.`,
        category: 'visit',
        priority: 'medium',
        icon: 'calendar',
        referenceType: 'VisitRequest',
        referenceId: visit._id,
        actionUrl: '/owner/visits'
      });
    } catch (err) {
      console.error('Error in visit:requested notification handler:', err.message);
    }
  });

  // 2. Visit Tour Accepted
  authEventEmitter.on('visit:accepted', async ({ visit }) => {
    try {
      await notificationService.createNotification({
        recipientId: visit.tenantId,
        actorId: visit.ownerId,
        notificationType: 'visit_accepted',
        title: 'Visit Approved!',
        message: 'Your property tour schedule request was approved by the owner.',
        description: `Date: ${new Date(visit.date).toLocaleDateString()}. Time: ${visit.time}.`,
        category: 'visit',
        priority: 'high',
        icon: 'calendar-check',
        referenceType: 'VisitRequest',
        referenceId: visit._id,
        actionUrl: '/tenant/visits'
      });
    } catch (err) {
      console.error('Error in visit:accepted notification handler:', err.message);
    }
  });

  // 3. Visit Tour Rejected
  authEventEmitter.on('visit:rejected', async ({ visit }) => {
    try {
      await notificationService.createNotification({
        recipientId: visit.tenantId,
        actorId: visit.ownerId,
        notificationType: 'visit_rejected',
        title: 'Visit Request Declined',
        message: 'Your property tour schedule request was declined by the owner.',
        category: 'visit',
        priority: 'low',
        icon: 'calendar-x',
        referenceType: 'VisitRequest',
        referenceId: visit._id,
        actionUrl: '/tenant/visits'
      });
    } catch (err) {
      console.error('Error in visit:rejected notification handler:', err.message);
    }
  });

  // 4. Visit Tour Rescheduled
  authEventEmitter.on('visit:rescheduled', async ({ visit }) => {
    try {
      // Alert both recipient parties
      const isOwnerActor = String(visit.ownerId) === String(visit.lastUpdatedBy || visit.ownerId);
      const recipientId = isOwnerActor ? visit.tenantId : visit.ownerId;
      const actorId = isOwnerActor ? visit.ownerId : visit.tenantId;

      await notificationService.createNotification({
        recipientId,
        actorId,
        notificationType: 'visit_rescheduled',
        title: 'Visit Schedule Rescheduled',
        message: 'A reschedule proposal was submitted for your property tour.',
        description: `New Date: ${new Date(visit.date).toLocaleDateString()}. Time: ${visit.time}. Reason: ${visit.rescheduleReason || 'None'}`,
        category: 'visit',
        priority: 'medium',
        icon: 'clock',
        referenceType: 'VisitRequest',
        referenceId: visit._id,
        actionUrl: isOwnerActor ? '/tenant/visits' : '/owner/visits'
      });
    } catch (err) {
      console.error('Error in visit:rescheduled notification handler:', err.message);
    }
  });

  // ========================================================
  // REVIEWS & REPUTATION EVENTS
  // ========================================================

  // 1. New Review Added
  authEventEmitter.on('review:created', async ({ review }) => {
    try {
      // Find the recipient based on review category
      let recipientId = null;
      let actionUrl = '/notifications';

      if (review.category === 'property' || review.category === 'owner') {
        recipientId = review.ownerId;
        actionUrl = '/owner/properties';
      } else if (review.category === 'roommate') {
        recipientId = review.roommateId;
        actionUrl = '/roommates/dashboard';
      }

      if (recipientId) {
        await notificationService.createNotification({
          recipientId,
          actorId: review.authorId,
          notificationType: 'review_created',
          title: 'New Review Rating Received',
          message: `Someone wrote a new ${review.rating}-Star review about your ${review.category}.`,
          description: review.content,
          category: 'review',
          priority: 'medium',
          icon: 'star',
          referenceType: 'Review',
          referenceId: review._id,
          actionUrl
        });
      }
    } catch (err) {
      console.error('Error in review:created notification handler:', err.message);
    }
  });

  // 2. Owner Response Reply
  authEventEmitter.on('review:replied', async ({ review, reply }) => {
    try {
      await notificationService.createNotification({
        recipientId: review.authorId,
        actorId: reply.authorId,
        notificationType: 'review_reply',
        title: 'Response Added to your Review',
        message: 'A listing owner or roommate replied to your submitted feedback rating.',
        description: reply.content,
        category: 'review',
        priority: 'medium',
        icon: 'message-square',
        referenceType: 'Review',
        referenceId: review._id,
        actionUrl: review.category === 'property' ? `/properties/${review.propertyId}` : '/roommates/dashboard'
      });
    } catch (err) {
      console.error('Error in review:replied notification handler:', err.message);
    }
  });

  // 3. Helpful Upvote
  authEventEmitter.on('review:voted', async ({ review, userId, voteType }) => {
    try {
      if (voteType === 'helpful') {
        await notificationService.createNotification({
          recipientId: review.authorId,
          actorId: userId,
          notificationType: 'review_upvoted',
          title: 'Review Upvoted',
          message: 'Someone found your review comments helpful.',
          category: 'review',
          priority: 'low',
          icon: 'thumbs-up',
          referenceType: 'Review',
          referenceId: review._id,
          actionUrl: '/notifications'
        });
      }
    } catch (err) {
      console.error('Error in review:voted notification handler:', err.message);
    }
  });
};

export default registerNotificationEventHandlers;
