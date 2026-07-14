/**
 * Centralized Permission String Constants for StayMate
 */
export const PERMISSIONS = {
  // Property Permissions
  PROPERTY_CREATE: 'property:create',
  PROPERTY_UPDATE: 'property:update',
  PROPERTY_DELETE: 'property:delete',
  PROPERTY_VERIFY: 'property:verify',
  PROPERTY_FEATURE: 'property:feature',

  // Wishlist Permissions
  WISHLIST_CREATE: 'wishlist:create',
  WISHLIST_DELETE: 'wishlist:delete',

  // Chat/Messaging Permissions
  CHAT_SEND: 'chat:send',
  CHAT_DELETE: 'chat:delete',
  CHAT_MODERATE: 'chat:moderate',

  // Review Permissions
  REVIEW_CREATE: 'review:create',
  REVIEW_UPDATE: 'review:update',
  REVIEW_DELETE: 'review:delete',

  // Reporting Permissions
  REPORT_CREATE: 'report:create',
  REPORT_REVIEW: 'report:review',
  REPORT_RESOLVE: 'report:resolve',

  // Booking/Visit Permissions
  VISIT_CREATE: 'visit:create',
  VISIT_APPROVE: 'visit:approve',
  VISIT_REJECT: 'visit:reject',

  // Notifications Permissions
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_DELETE: 'notification:delete',

  // Analytics Permissions
  ANALYTICS_VIEW: 'analytics:view',
  DASHBOARD_VIEW: 'dashboard:view',

  // Administrative / Account Permissions
  USER_UPDATE: 'user:update',
  USER_SUSPEND: 'user:suspend',
  USER_VERIFY: 'user:verify',
  ROLE_UPDATE: 'role:update',
  SETTINGS_UPDATE: 'settings:update',
};

export default PERMISSIONS;
