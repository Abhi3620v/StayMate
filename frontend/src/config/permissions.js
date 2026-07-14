/**
 * Centralized Permission String Constants for StayMate (Frontend)
 */
export const PERMISSIONS = {
  PROPERTY_CREATE: 'property:create',
  PROPERTY_UPDATE: 'property:update',
  PROPERTY_DELETE: 'property:delete',
  PROPERTY_VERIFY: 'property:verify',
  PROPERTY_FEATURE: 'property:feature',

  WISHLIST_CREATE: 'wishlist:create',
  WISHLIST_DELETE: 'wishlist:delete',

  CHAT_SEND: 'chat:send',
  CHAT_DELETE: 'chat:delete',
  CHAT_MODERATE: 'chat:moderate',

  REVIEW_CREATE: 'review:create',
  REVIEW_UPDATE: 'review:update',
  REVIEW_DELETE: 'review:delete',

  REPORT_CREATE: 'report:create',
  REPORT_REVIEW: 'report:review',
  REPORT_RESOLVE: 'report:resolve',

  VISIT_CREATE: 'visit:create',
  VISIT_APPROVE: 'visit:approve',
  VISIT_REJECT: 'visit:reject',

  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_DELETE: 'notification:delete',

  ANALYTICS_VIEW: 'analytics:view',
  DASHBOARD_VIEW: 'dashboard:view',

  USER_UPDATE: 'user:update',
  USER_SUSPEND: 'user:suspend',
  USER_VERIFY: 'user:verify',
  ROLE_UPDATE: 'role:update',
  SETTINGS_UPDATE: 'settings:update',
};

export default PERMISSIONS;
