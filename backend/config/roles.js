/**
 * Static Role-Permission Mapping Registry
 * Supports a progressive linear hierarchy: Guest -> Tenant -> Owner -> Moderator -> Admin
 */

const GUEST_PERMISSIONS = [
  'property:view',
  'roommate:view',
];

const TENANT_PERMISSIONS = [
  ...GUEST_PERMISSIONS,
  'wishlist:create',
  'wishlist:delete',
  'chat:send',
  'review:create',
  'review:update',
  'report:create',
  'visit:create',
  'dashboard:view',
  'user:update',
];

const OWNER_PERMISSIONS = [
  ...TENANT_PERMISSIONS,
  'property:create',
  'property:update',
  'property:delete',
  'property:publish',
  'property:archive',
  'property:duplicate',
  'visit:approve',
  'visit:reject',
  'analytics:view',
];

const MODERATOR_PERMISSIONS = [
  ...OWNER_PERMISSIONS,
  'chat:delete',
  'chat:moderate',
  'review:delete',
  'report:review',
  'report:resolve',
  'property:suspend',
  'property:review',
  'user:suspend',
];

const ADMIN_PERMISSIONS = [
  ...MODERATOR_PERMISSIONS,
  'property:verify',
  'property:feature',
  'user:verify',
  'role:update',
  'settings:update',
  'notification:send',
  'notification:delete',
];

export const ROLE_PERMISSIONS = {
  guest: GUEST_PERMISSIONS,
  tenant: TENANT_PERMISSIONS,
  owner: OWNER_PERMISSIONS,
  moderator: MODERATOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
};

/**
 * Helper to get all permissions for a specific role
 * @param {string} role - Role enum string
 * @returns {string[]} Array of permissions
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role.toLowerCase()] || [];
};
