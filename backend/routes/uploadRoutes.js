import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import { uploadService } from '../services/uploadService.js';
import { isDbConnected, mockUsers } from '../config/inMemoryDb.js';
import User from '../models/User.js';
import { ValidationError } from '../utils/errors.js';
import { logAction } from '../utils/auditLogger.js';

const router = express.Router();

/**
 * Endpoint to upload profile picture
 * POST /api/v1/uploads/profile-picture
 */
router.post('/profile-picture', protect, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('Please upload an image file.');
    }

    // Upload via Universal Upload Service
    const result = await uploadService.uploadProfileImage(req.file.buffer);

    // Update user avatar
    let user;
    if (isDbConnected()) {
      user = await User.findById(req.user._id);
      if (user) {
        user.avatar = result.url;
        await user.save();
      }
    } else {
      user = mockUsers.find((u) => u._id === req.user._id || u._id.toString() === req.user._id);
      if (user) {
        user.avatar = result.url;
      }
    }

    if (!user) {
      throw new ValidationError('User session invalid.');
    }

    // Dispatch audit logging trail
    await logAction({
      userId: user._id,
      action: 'PROFILE_PICTURE_CHANGE',
      status: 'success',
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully.',
      data: {
        avatar: result.url,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint to upload chat attachments (images, documents, PDFs)
 * POST /api/v1/uploads/chat-attachment
 */
router.post('/chat-attachment', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('Please upload a file.');
    }

    // Process chat file attachment via uploadService
    const result = await uploadService.uploadChatImages(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        url: result.url,
        name: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Endpoint to upload review image attachments
 * POST /api/v1/uploads/review-attachment
 */
router.post('/review-attachment', protect, upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ValidationError('Please upload at least one image file.');
    }
    const buffers = req.files.map(f => f.buffer);
    const results = await uploadService.uploadReviewImages(buffers);
    res.status(200).json({
      success: true,
      message: 'Review images uploaded successfully.',
      data: results.map(r => ({ url: r.url, publicId: r.publicId || r.public_id || '' }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
