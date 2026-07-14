import authService from '../services/authService.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { isDbConnected, mockSessions, mockUsers, mockTrustedDevices } from '../config/inMemoryDb.js';
import TrustedDevice from '../models/TrustedDevice.js';
import { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema 
} from '../validators/authSchema.js';
import { ValidationError } from '../utils/errors.js';
import crypto from 'crypto';
import { logAction } from '../utils/auditLogger.js';
import { calculateCompleteness } from '../utils/profileCompleteness.js';

// Cookie options helper for rotated HttpOnly refresh tokens
const setRefreshCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Controller managing HTTP login session endpoints
 */
export const authController = {
  /**
   * Registers a new tenant or owner account
   */
  register: async (req, res, next) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError('Validation failed', validationResult.error.flatten().fieldErrors);
      }

      const user = await authService.register(validationResult.data, req);
      const isRealEmailEnabled = !!(process.env.BREVO_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));

      res.status(201).json({
        success: true,
        message: isRealEmailEnabled 
          ? 'Registration successful! Please check your email to verify your account.' 
          : 'Registration successful! Verification email logged to console.',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Log in user session using credentials
   */
  login: async (req, res, next) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError('Validation failed', validationResult.error.flatten().fieldErrors);
      }

      const { user, accessToken, refreshToken } = await authService.login(validationResult.data, req);

      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            status: user.status,
            customPermissions: user.customPermissions,
          },
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Log in utilizing Google ID Token
   */
  googleLogin: async (req, res, next) => {
    try {
      const { idToken, role, isRegistering } = req.body;
      if (!idToken) {
        throw new ValidationError('Google ID Token is required.');
      }

      const { user, accessToken, refreshToken } = await authService.verifyGoogle(idToken, role || 'tenant', isRegistering, req);

      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Google login successful.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            status: user.status,
            customPermissions: user.customPermissions,
          },
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refreshes active accessToken session
   */
  refreshSession: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.token;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Refresh token cookie missing.',
            code: 'SESSION_EXPIRED',
          },
        });
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken, req);

      setRefreshCookie(res, newRefreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            status: user.status,
            customPermissions: user.customPermissions,
          },
        },
      });
    } catch (error) {
      // Clear cookie if refresh verification failed
      res.clearCookie('token');
      next(error);
    }
  },

  /**
   * Logs out user and invalidates current device cookie
   */
  logout: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.token;
      if (refreshToken) {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        if (isDbConnected()) {
          await Session.deleteOne({ refreshTokenHash: tokenHash });
        } else {
          const idx = mockSessions.findIndex((s) => s.refreshTokenHash === tokenHash);
          if (idx !== -1) mockSessions.splice(idx, 1);
        }
      }

      // Log logout audit
      if (req.user) {
        await logAction({
          userId: req.user._id,
          action: 'AUTH_LOGOUT',
          status: 'success',
          req,
        });
      }

      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Triggers forgot password reset request
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ValidationError('Email address is required.');
      }

      await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'Password reset link printed to server console.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Performs password reset verification
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        throw new ValidationError('Token and password parameters are required.');
      }

      await authService.resetPassword({ token, password }, req);

      res.status(200).json({
        success: true,
        message: 'Password reset successful. You can log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verifies email token
   */
  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) {
        throw new ValidationError('Activation verification token is missing.');
      }

      await authService.verifyEmail(token, req);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully! Account is now active.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resends email verification links
   */
  resendVerification: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ValidationError('Email address is required.');
      }

      await authService.resendVerification(email);

      res.status(200).json({
        success: true,
        message: 'Verification email resent successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change current password
   */
  changePassword: async (req, res, next) => {
    try {
      const validationResult = changePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new ValidationError('Validation failed', validationResult.error.flatten().fieldErrors);
      }

      const { user, accessToken, refreshToken } = await authService.changePassword({
        userId: req.user._id,
        ...validationResult.data,
      }, req);

      setRefreshCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Returns active user session info
   */
  getMe: async (req, res, next) => {
    try {
      const completeness = calculateCompleteness(req.user);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar,
            status: req.user.status,
            customPermissions: req.user.customPermissions,
            username: req.user.username || `user_${req.user._id.toString().slice(-6)}`,
            phone: req.user.phone || '',
            bio: req.user.bio || '',
            preferences: req.user.preferences || { theme: 'light', language: 'en' },
          },
          completeness,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetches active login sessions for user
   */
  getSessions: async (req, res, next) => {
    try {
      let sessions;
      if (isDbConnected()) {
        sessions = await Session.find({ userId: req.user._id, revoked: false });
      } else {
        sessions = mockSessions.filter(
          (s) =>
            (s.userId === req.user._id || s.userId.toString() === req.user._id.toString()) &&
            !s.revoked
        );
      }

      const currentTokenHash = req.cookies.token
        ? crypto.createHash('sha256').update(req.cookies.token).digest('hex')
        : null;

      const data = sessions.map((s) => ({
        id: s._id,
        deviceName: s.deviceName,
        browser: s.browser,
        operatingSystem: s.operatingSystem,
        ipAddress: s.ipAddress,
        loginTimestamp: s.loginTimestamp,
        lastActivity: s.lastActivity,
        isCurrent: s.refreshTokenHash === currentTokenHash,
      }));

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Terminates specific login session by ID
   */
  revokeSession: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      if (isDbConnected()) {
        await Session.findOneAndDelete({ _id: id, userId: req.user._id });
      } else {
        const idx = mockSessions.findIndex(
          (s) =>
            s._id.toString() === id.toString() &&
            s.userId.toString() === req.user._id.toString()
        );
        if (idx !== -1) mockSessions.splice(idx, 1);
      }

      // Log session revoke audit trail
      await logAction({
        userId: req.user._id,
        action: 'AUTH_SESSION_REVOKE',
        status: 'success',
        details: { sessionId: id },
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Session terminated successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Terminates all active sessions (Logout all devices)
   */
  revokeAllSessions: async (req, res, next) => {
    try {
      let user;
      if (isDbConnected()) {
        user = await User.findById(req.user._id);
        user.authVersion += 1;
        await user.save();
        await Session.deleteMany({ userId: req.user._id });
      } else {
        user = mockUsers.find((u) => u._id.toString() === req.user._id.toString());
        if (user) user.authVersion += 1;

        let i = mockSessions.length;
        while (i--) {
          if (mockSessions[i].userId.toString() === req.user._id.toString()) {
            mockSessions.splice(i, 1);
          }
        }
      }

      // Log audit
      await logAction({
        userId: req.user._id,
        action: 'AUTH_SESSION_REVOKE_ALL',
        status: 'success',
        req,
      });

      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: 'All active sessions terminated successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * View all devices registered under user (Section 3)
   */
  getDevices: async (req, res, next) => {
    try {
      let devices;
      if (isDbConnected()) {
        devices = await TrustedDevice.find({ userId: req.user._id });
      } else {
        devices = mockTrustedDevices.filter(
          (d) => d.userId.toString() === req.user._id.toString()
        );
      }

      res.status(200).json({
        success: true,
        data: devices.map((d) => ({
          id: d._id,
          deviceName: d.deviceName,
          browser: d.browser,
          operatingSystem: d.operatingSystem,
          trustedStatus: d.trustedStatus,
          lastUsed: d.lastUsed,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Trusts current device (Section 3)
   */
  trustDevice: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      let device;
      if (isDbConnected()) {
        device = await TrustedDevice.findOneAndUpdate(
          { _id: id, userId: req.user._id },
          { trustedStatus: 'trusted' },
          { new: true }
        );
      } else {
        device = mockTrustedDevices.find(
          (d) => d._id.toString() === id.toString() && d.userId.toString() === req.user._id.toString()
        );
        if (device) device.trustedStatus = 'trusted';
      }

      if (!device) {
        throw new ValidationError('Device registry not found.');
      }

      await logAction({
        userId: req.user._id,
        action: 'AUTH_DEVICE_TRUST',
        status: 'success',
        details: { deviceId: id },
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Device trusted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Renames a trusted device (Section 3)
   */
  renameDevice: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { deviceName } = req.body;

      if (!deviceName || deviceName.trim() === '') {
        throw new ValidationError('Device name is required.');
      }

      let device;
      if (isDbConnected()) {
        device = await TrustedDevice.findOneAndUpdate(
          { _id: id, userId: req.user._id },
          { deviceName },
          { new: true }
        );
      } else {
        device = mockTrustedDevices.find(
          (d) => d._id.toString() === id.toString() && d.userId.toString() === req.user._id.toString()
        );
        if (device) device.deviceName = deviceName;
      }

      if (!device) {
        throw new ValidationError('Device registry not found.');
      }

      res.status(200).json({
        success: true,
        message: 'Device renamed successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes a trusted device registry (Section 3)
   */
  removeDevice: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (isDbConnected()) {
        await TrustedDevice.findOneAndDelete({ _id: id, userId: req.user._id });
      } else {
        const idx = mockTrustedDevices.findIndex(
          (d) => d._id.toString() === id.toString() && d.userId.toString() === req.user._id.toString()
        );
        if (idx !== -1) mockTrustedDevices.splice(idx, 1);
      }

      await logAction({
        userId: req.user._id,
        action: 'AUTH_DEVICE_REVOKE',
        status: 'success',
        details: { deviceId: id },
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Device registration removed.',
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
