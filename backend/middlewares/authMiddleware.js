import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getPermissionsForRole } from '../config/roles.js';
import { isDbConnected, mockUsers } from '../config/inMemoryDb.js';

/**
 * Middleware to protect routes against unauthenticated requests.
 * Extracts token from headers or cookies.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Check for token in query parameters (useful for iframe document renders)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }
  // 3. Fallback to token in request cookies if cookie-parser is mounted
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized to access this route. Token missing.',
        code: 'UNAUTHORIZED',
      },
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_fallback_key');

    // Fetch user and ensure status checks
    let user;
    if (isDbConnected()) {
      user = await User.findById(decoded.id);
    } else {
      user = mockUsers.find((u) => u._id === decoded.id || u._id.toString() === decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User belonging to this token no longer exists.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Verify token version matches user version (invalidation on password reset/logout all)
    if (decoded.version !== user.authVersion) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Session expired due to account changes or logout. Please log in again.',
          code: 'SESSION_REVOKED',
        },
      });
    }

    // Check account status restrictions
    if (['suspended', 'blocked', 'deleted'].includes(user.status)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Your account is currently ${user.status}. Access denied.`,
          code: 'ACCOUNT_RESTRICTED',
        },
      });
    }

    // Assign user context payload to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authorization token.',
        code: 'INVALID_TOKEN',
      },
    });
  }
};

/**
 * Hybrid Access Control Middleware (RBAC + PBAC)
 * Grants access if user matches allowed roles OR possesses required permissions.
 *
 * @param {Object} options - Access parameters
 * @param {string[]} [options.roles] - Allowed user roles
 * @param {string[]} [options.permissions] - Required granular permission tokens
 * @param {boolean} [options.requireAll=false] - If true, all specified permissions are mandatory
 */
export const checkAccess = ({ roles = [], permissions = [], requireAll = false } = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication context missing. protect middleware must run first.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // 1. Evaluate Role-Based Access Control (RBAC)
    const hasAllowedRole = roles.length === 0 || roles.includes(req.user.role);

    // 2. Evaluate Permission-Based Access Control (PBAC)
    let hasRequiredPermissions = true;

    if (permissions.length > 0) {
      // Union of static permissions (defined by role) and custom user overrides (on User model)
      const rolePermissions = getPermissionsForRole(req.user.role);
      const customPermissions = req.user.customPermissions || [];
      const userPermissionsUnion = new Set([...rolePermissions, ...customPermissions]);

      if (requireAll) {
        hasRequiredPermissions = permissions.every((p) => userPermissionsUnion.has(p));
      } else {
        hasRequiredPermissions = permissions.some((p) => userPermissionsUnion.has(p));
      }
    }

    // 3. Resolve Access Decision
    // If both filters are defined, we check if they meet either standard (RBAC or PBAC)
    const accessGranted =
      roles.length > 0 && permissions.length > 0
        ? hasAllowedRole || hasRequiredPermissions
        : roles.length > 0
        ? hasAllowedRole
        : hasRequiredPermissions;

    if (!accessGranted) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access Denied: Insufficient roles or permission levels.',
          code: 'FORBIDDEN',
        },
      });
    }

    next();
  };
};
