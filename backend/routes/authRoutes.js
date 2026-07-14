import express from 'express';
import { authController } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/refresh-token', authController.refreshSession);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Authenticated routes
router.get('/me', protect, authController.getMe);
router.patch('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);

// Active Session Management routes
router.get('/sessions', protect, authController.getSessions);
router.delete('/sessions/:id', protect, authController.revokeSession);
router.delete('/sessions', protect, authController.revokeAllSessions);

// Trusted Device Management routes
router.get('/devices', protect, authController.getDevices);
router.post('/devices/:id/trust', protect, authController.trustDevice);
router.patch('/devices/:id', protect, authController.renameDevice);
router.delete('/devices/:id', protect, authController.removeDevice);

export default router;
