import authEventEmitter from '../utils/eventEmitter.js';
import emailService from './emailService.js';
import { logAction } from '../utils/auditLogger.js';
import TrustedDevice from '../models/TrustedDevice.js';
import { isDbConnected } from '../config/inMemoryDb.js';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

/**
 * Register all transactional security event listeners
 */
export const registerAuthEventHandlers = () => {
  
  // 1. User Registered Event Handler
  authEventEmitter.on('user:registered', async ({ user, verificationToken, req }) => {
    try {
      // Log audit trail
      await logAction({
        userId: user._id,
        action: 'AUTH_REGISTER',
        status: 'success',
        req,
      });

      // Send Welcome/Activation Email
      await emailService.sendVerificationEmail(user, verificationToken || user.emailVerificationToken);
    } catch (err) {
      console.error('Error in user:registered event handler:', err.message);
    }
  });

  // 2. User Logged-In Event Handler
  authEventEmitter.on('user:logged-in', async ({ user, req }) => {
    try {
      // Extract request telemetry
      let browser = 'Unknown Browser';
      let operatingSystem = 'Unknown OS';
      let deviceName = 'Unknown Device';
      let ipAddress = 'Unknown IP';

      if (req) {
        const userAgentString = req.headers['user-agent'];
        if (userAgentString) {
          const parser = new UAParser(userAgentString);
          const result = parser.getResult();
          browser = `${result.browser.name || 'Unknown Browser'} ${result.browser.version || ''}`.trim();
          operatingSystem = result.os.name || 'Unknown OS';
          deviceName = `${result.device.vendor || ''} ${result.device.model || ''}`.trim() || 'Desktop';
        }
        ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown IP';
        if (ipAddress.includes('::ffff:')) {
          ipAddress = ipAddress.split('::ffff:')[1];
        }
      }

      // Generate device fingerprint (hash of OS + Browser + User ID)
      const fingerprintRaw = `${user._id}_${operatingSystem}_${browser}`;
      const fingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');

      let deviceDetails = { browser, operatingSystem, ipAddress };

      // Match Trusted Device registry
      let trustedDevice = null;
      if (isDbConnected()) {
        trustedDevice = await TrustedDevice.findOne({ userId: user._id, fingerprint });
        if (!trustedDevice) {
          // Register device as pending trust
          trustedDevice = await TrustedDevice.create({
            userId: user._id,
            deviceName: `${deviceName} (${operatingSystem})`,
            browser,
            operatingSystem,
            fingerprint,
            trustedStatus: 'pending',
            lastUsed: new Date(),
          });

          // Trigger suspicious/new device alert email notification
          await emailService.sendNewDeviceLoginEmail(user, deviceDetails);
        } else {
          // Update last used timestamp
          trustedDevice.lastUsed = new Date();
          await trustedDevice.save();
        }
      }

      // Log successful login audit trail
      await logAction({
        userId: user._id,
        action: 'AUTH_LOGIN',
        status: 'success',
        details: { deviceId: trustedDevice?._id || 'mock_device' },
        req,
      });

    } catch (err) {
      console.error('Error in user:logged-in event handler:', err.message);
    }
  });

  // 3. Account Locked Event Handler
  authEventEmitter.on('user:locked', async ({ user, req }) => {
    try {
      await logAction({
        userId: user._id,
        action: 'AUTH_LOCKOUT',
        status: 'failure',
        details: { reason: '5 consecutive failed attempts' },
        req,
      });

      await emailService.sendLockoutEmail(user);
    } catch (err) {
      console.error('Error in user:locked event handler:', err.message);
    }
  });

  // 4. Account Unlocked Event Handler
  authEventEmitter.on('user:unlocked', async ({ user, req }) => {
    try {
      await logAction({
        userId: user._id,
        action: 'AUTH_UNLOCK',
        status: 'success',
        req,
      });

      await emailService.sendAccountUnlockedEmail(user);
    } catch (err) {
      console.error('Error in user:unlocked event handler:', err.message);
    }
  });

  // 5. Password Changed Event Handler
  authEventEmitter.on('password:changed', async ({ user, req }) => {
    try {
      await logAction({
        userId: user._id,
        action: 'AUTH_PASSWORD_CHANGE',
        status: 'success',
        req,
      });

      await emailService.sendPasswordChangedEmail(user);
    } catch (err) {
      console.error('Error in password:changed event handler:', err.message);
    }
  });

  // 6. Password Reset Event Handler
  authEventEmitter.on('password:reset', async ({ user, req }) => {
    try {
      await logAction({
        userId: user._id,
        action: 'AUTH_PASSWORD_RESET',
        status: 'success',
        req,
      });

      await emailService.sendPasswordChangedEmail(user);
    } catch (err) {
      console.error('Error in password:reset event handler:', err.message);
    }
  });

  // 7. Email Verified Event Handler
  authEventEmitter.on('email:verified', async ({ user, req }) => {
    try {
      await logAction({
        userId: user._id,
        action: 'AUTH_EMAIL_VERIFICATION',
        status: 'success',
        req,
      });

      await emailService.sendWelcomeEmail(user);
    } catch (err) {
      console.error('Error in email:verified event handler:', err.message);
    }
  });

  // 8. Account Deleted Event Handler
  authEventEmitter.on('account:deleted', async ({ user, req }) => {
    try {
      await logAction({
        userId: user?._id || null,
        action: 'USER_DELETE',
        status: 'success',
        req,
      });

      await emailService.sendAccountDeletionEmail(user);
    } catch (err) {
      console.error('Error in account:deleted event handler:', err.message);
    }
  });
};

export default registerAuthEventHandlers;
