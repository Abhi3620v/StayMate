import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { UAParser } from 'ua-parser-js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { isDbConnected, mockUsers, mockSessions } from '../config/inMemoryDb.js';
import emailService from './emailService.js';
import authEventEmitter from '../utils/eventEmitter.js';
import { 
  ConflictError, 
  AuthenticationError, 
  NotFoundError, 
  ValidationError 
} from '../utils/errors.js';

// --- IN-MEMORY FALLBACK DB HELPERS ---

const findUserByEmail = async (email, selectPassword = false) => {
  if (isDbConnected()) {
    let query = User.findOne({ email });
    if (selectPassword) {
      query = query.select('+password');
    }
    return await query;
  }
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = async (id, selectPassword = false) => {
  if (isDbConnected()) {
    let query = User.findById(id);
    if (selectPassword) {
      query = query.select('+password');
    }
    return await query;
  }
  return mockUsers.find((u) => u._id === id || u._id.toString() === id);
};

const findUserByToken = async (field, hashedToken) => {
  if (isDbConnected()) {
    const queryObj = {
      [field]: hashedToken,
      [`${field.replace('Token', 'Expire')}`]: { $gt: Date.now() }
    };
    return await User.findOne(queryObj);
  }
  return mockUsers.find((u) => {
    const tokenVal = u[field];
    const expireVal = u[`${field.replace('Token', 'Expire')}`];
    return tokenVal === hashedToken && expireVal > Date.now();
  });
};

// --- SESSION CONFIGURATION UTILITIES ---

const createSession = async (user, refreshToken, req) => {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expirationTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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

  const sessionPayload = {
    userId: user._id,
    refreshTokenHash: tokenHash,
    deviceName,
    browser,
    operatingSystem,
    ipAddress,
    loginTimestamp: new Date(),
    lastActivity: new Date(),
    expirationTime,
    revoked: false,
  };

  try {
    if (isDbConnected()) {
      await Session.create(sessionPayload);
    } else {
      mockSessions.push({
        _id: `mock_sess_${Date.now()}`,
        ...sessionPayload,
      });
    }
  } catch (error) {
    console.error('Session creation failed:', error.message);
  }
};

// --- AUTH SERVICE DEFINITIONS ---

export const authService = {
  /**
   * Generates Access and Refresh token pairs for a user
   */
  generateTokens: (user) => {
    const payload = {
      id: user._id,
      role: user.role,
      version: user.authVersion,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jwt_secret_fallback_key',
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, version: user.authVersion },
      process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_fallback_key',
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );

    return { accessToken, refreshToken };
  },

  /**
   * Registers a new tenant or owner account
   */
  register: async ({ name, email, password, role }, req = null) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    let user;
    if (isDbConnected()) {
      user = await User.create({
        name,
        email,
        password,
        role,
        status: 'email_verification_pending',
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpire: verificationExpire,
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = {
        _id: `mock_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role,
        status: 'email_verification_pending',
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpire: verificationExpire,
        customPermissions: [],
        avatar: '',
        authVersion: 1,
        failedAttempts: 0,
        comparePassword: async function (candidate) {
          return await bcrypt.compare(candidate, this.password);
        },
        save: async function () {
          return this;
        }
      };
      mockUsers.push(user);
    }

    // Emit event asynchronously
    authEventEmitter.emit('user:registered', { user, verificationToken, req });

    return user;
  },

  /**
   * Log in user using email and password credentials with failed lockout counts (Section 2)
   */
  login: async ({ email, password }, req = null) => {
    const user = await findUserByEmail(email, true);
    if (!user) {
      throw new AuthenticationError('Invalid email or password credentials.');
    }

    // Check account temporary lock status
    if (user.lockExpiration && user.lockExpiration > Date.now()) {
      const minutesLeft = Math.ceil((user.lockExpiration - Date.now()) / (60 * 1000));
      throw new AuthenticationError(`Account locked due to consecutive failed attempts. Try again in ${minutesLeft} minutes.`);
    }

    // Unlock account if lock expired previously
    if (user.lockExpiration && user.lockExpiration <= Date.now()) {
      user.failedAttempts = 0;
      user.lockExpiration = undefined;
      if (isDbConnected()) {
        await User.findByIdAndUpdate(user._id, { failedAttempts: 0, lockExpiration: null });
      }
      authEventEmitter.emit('user:unlocked', { user, req });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      user.lastFailedAttempt = new Date();

      if (user.failedAttempts >= 5) {
        // Lock account for 15 minutes
        user.lockExpiration = new Date(Date.now() + 15 * 60 * 1000);
        if (isDbConnected()) {
          await User.findByIdAndUpdate(user._id, {
            failedAttempts: user.failedAttempts,
            lastFailedAttempt: user.lastFailedAttempt,
            lockExpiration: user.lockExpiration,
          });
        }
        
        authEventEmitter.emit('user:locked', { user, req });
        
        throw new AuthenticationError('Account locked due to 5 consecutive failed attempts. Try again in 15 minutes.');
      } else {
        if (isDbConnected()) {
          await User.findByIdAndUpdate(user._id, {
            failedAttempts: user.failedAttempts,
            lastFailedAttempt: user.lastFailedAttempt,
          });
        }
        throw new AuthenticationError('Invalid email or password credentials.');
      }
    }

    if (['suspended', 'blocked', 'deleted'].includes(user.status)) {
      throw new AuthenticationError(`Your account has been ${user.status}. Access denied.`);
    }

    // Reset failed counter on login success
    user.failedAttempts = 0;
    user.lockExpiration = undefined;
    user.lastLogin = new Date();

    if (isDbConnected()) {
      await User.findByIdAndUpdate(user._id, {
        failedAttempts: 0,
        lockExpiration: null,
        lastLogin: user.lastLogin,
      });
    }

    const tokens = authService.generateTokens(user);

    // Save Active Session details
    await createSession(user, tokens.refreshToken, req);

    // Emit event asynchronously
    authEventEmitter.emit('user:logged-in', { user, req });

    return { user, ...tokens };
  },

  /**
   * Verify email verification tokens and activate account
   */
  verifyEmail: async (token, req = null) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await findUserByToken('emailVerificationToken', hashedToken);

    if (!user) {
      throw new ValidationError('Invalid or expired email verification link.');
    }

    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    if (isDbConnected()) {
      await user.save();
    }

    // Emit event asynchronously
    authEventEmitter.emit('email:verified', { user, req });

    return user;
  },

  /**
   * Resends email verification links
   */
  resendVerification: async (email) => {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new NotFoundError('No account found with this email address.');
    }

    if (user.status !== 'email_verification_pending') {
      throw new ValidationError('This account has already been verified.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpire = verificationExpire;

    if (isDbConnected()) {
      await user.save();
    }

    // Send verification email via SMTP/Gmail app password
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (err) {
      console.error('Failed to send resend-verification email:', err.message);
    }

    const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    console.log('\n======================================================');
    console.log('✉️ [Email Verification Sandbox Link Resent]');
    console.log(`To: ${email}`);
    console.log(`Link: ${activationLink}`);
    console.log('======================================================\n');

    return true;
  },

  /**
   * Renews session using rotated Refresh Token
   */
  refresh: async (token, req = null) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_fallback_key');
      const user = await findUserById(decoded.id);

      if (!user) {
        throw new AuthenticationError('User no longer exists.');
      }

      if (decoded.version !== user.authVersion) {
        throw new AuthenticationError('Session version is invalid. Please log in again.');
      }

      // Check session hash in DB
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      let session;
      if (isDbConnected()) {
        session = await Session.findOne({ refreshTokenHash: tokenHash, revoked: false });
      } else {
        session = mockSessions.find((s) => s.refreshTokenHash === tokenHash && !s.revoked);
      }

      if (!session) {
        throw new AuthenticationError('Session expired or revoked.');
      }

      // Session activity log update
      session.lastActivity = new Date();
      if (isDbConnected()) {
        await session.save();
      }

      // Rotate token: delete/revoke old session, create new session
      if (isDbConnected()) {
        await Session.deleteOne({ refreshTokenHash: tokenHash });
      } else {
        const idx = mockSessions.findIndex((s) => s.refreshTokenHash === tokenHash);
        if (idx !== -1) mockSessions.splice(idx, 1);
      }

      const tokens = authService.generateTokens(user);
      await createSession(user, tokens.refreshToken, req);

      return { user, ...tokens };
    } catch (err) {
      throw new AuthenticationError('Invalid refresh token.');
    }
  },

  /**
   * Triggers secure password reset request
   */
  forgotPassword: async (email) => {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new NotFoundError('No account found with this email address.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = Date.now() + 15 * 60 * 1000;
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpire = resetExpire;

    if (isDbConnected()) {
      await user.save();
    }

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log('\n======================================================');
    console.log('🔑 [Password Reset Sandbox Link]');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetLink}`);
    console.log('======================================================\n');

    return true;
  },

  /**
   * Resets password using reset token
   */
  resetPassword: async ({ token, password }, req = null) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await findUserByToken('resetPasswordToken', hashedToken);

    if (!user) {
      throw new ValidationError('Invalid or expired password reset link.');
    }

    if (isDbConnected()) {
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.authVersion += 1;
      await user.save();
      // Revoke all existing sessions on password reset
      await Session.deleteMany({ userId: user._id });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.authVersion += 1;

      let i = mockSessions.length;
      while (i--) {
        if (mockSessions[i].userId.toString() === user._id.toString()) {
          mockSessions.splice(i, 1);
        }
      }
    }

    // Emit event asynchronously
    authEventEmitter.emit('password:reset', { user, req });

    return user;
  },

  /**
   * Modifies password of active logged-in user session
   */
  changePassword: async ({ userId, oldPassword, newPassword }, req = null) => {
    const user = await findUserById(userId, true);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ValidationError('Incorrect current password.');
    }

    if (isDbConnected()) {
      user.password = newPassword;
      user.authVersion += 1;
      await user.save();
      // Revoke all other device sessions
      await Session.deleteMany({ userId: user._id });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      user.authVersion += 1;

      let i = mockSessions.length;
      while (i--) {
        if (mockSessions[i].userId.toString() === user._id.toString()) {
          mockSessions.splice(i, 1);
        }
      }
    }

    // Emit event asynchronously
    authEventEmitter.emit('password:changed', { user, req });

    const tokens = authService.generateTokens(user);
    // Create new active session for rotated refresh token
    await createSession(user, tokens.refreshToken, req);

    return { user, ...tokens };
  },

  /**
   * Verifies and signs in users utilizing Google Oauth token
   */
  verifyGoogle: async (idToken, role = 'tenant', isRegistering = false, req = null) => {
    let email, name, picture, googleId;

    try {
      if (idToken.startsWith('mock-')) {
        const payload = JSON.parse(Buffer.from(idToken.split('-')[1], 'base64').toString('ascii'));
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      } else {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        if (!response.ok) {
          throw new Error('Google token validation failed');
        }
        const payload = await response.json();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      }
    } catch (error) {
      throw new AuthenticationError('Google verification failed. Token invalid.');
    }

    if (!email) {
      throw new ValidationError('Google account must have an associated email address.');
    }

    let user = await findUserByEmail(email);

    if (user) {
      if (isRegistering) {
        throw new ValidationError('An account with this email already exists. Please sign in.');
      }
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.avatar) {
        user.avatar = picture;
        needsSave = true;
      }
      if (user.status === 'email_verification_pending') {
        user.status = 'active';
        needsSave = true;
      }
      if (needsSave && isDbConnected()) {
        await user.save();
      }
    } else {
      if (isDbConnected()) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        user = await User.create({
          name,
          email,
          password: randomPassword,
          googleId,
          avatar: picture,
          status: 'active',
          role: role || 'tenant',
        });
      } else {
        user = {
          _id: `mock_google_${Date.now()}`,
          name,
          email,
          password: 'google_oauth_bypass',
          googleId,
          avatar: picture,
          status: 'active',
          role: role || 'tenant',
          customPermissions: [],
          authVersion: 1,
          comparePassword: async () => true,
          save: async function () { return this; }
        };
        mockUsers.push(user);
      }
    }

    user.lastLogin = new Date();
    if (isDbConnected()) {
      await User.findByIdAndUpdate(user._id, { lastLogin: user.lastLogin });
    }

    const tokens = authService.generateTokens(user);

    // Save Active Session
    await createSession(user, tokens.refreshToken, req);

    // Emit event asynchronously
    authEventEmitter.emit('user:logged-in', { user, req });

    return { user, ...tokens };
  }
};

export default authService;
