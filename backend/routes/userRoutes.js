import express from 'express';
import { userController } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Authenticated routes
router.patch('/profile', protect, userController.updateProfile);
router.delete('/account', protect, userController.deleteAccount);

export default router;
