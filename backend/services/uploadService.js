import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { ValidationError } from '../utils/errors.js';

// Centralized image upload helper
const processSingleUpload = async (fileBuffer, folder, limits = {}) => {
  const maxSize = limits.maxSize || 5 * 1024 * 1024; // Default 5MB

  if (!fileBuffer) {
    throw new ValidationError('File buffer is empty.');
  }
  if (fileBuffer.length > maxSize) {
    throw new ValidationError(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB.`);
  }

  try {
    return await uploadImage(fileBuffer, folder);
  } catch (error) {
    throw new Error(`Media cloud upload failure: ${error.message}`);
  }
};

export const uploadService = {
  /**
   * Upload user profile avatar
   */
  uploadProfileImage: async (fileBuffer) => {
    return await processSingleUpload(fileBuffer, 'avatars', { maxSize: 2 * 1024 * 1024 });
  },

  /**
   * Upload property marketplace photos
   */
  uploadPropertyImages: async (fileBuffers) => {
    if (!Array.isArray(fileBuffers)) {
      return [await processSingleUpload(fileBuffers, 'properties')];
    }
    const uploadPromises = fileBuffers.map((buf) => processSingleUpload(buf, 'properties'));
    return await Promise.all(uploadPromises);
  },

  /**
   * Upload verification identity credentials documents
   */
  uploadVerificationDocuments: async (fileBuffers) => {
    if (!Array.isArray(fileBuffers)) {
      return [await processSingleUpload(fileBuffers, 'verifications', { maxSize: 10 * 1024 * 1024 })];
    }
    const uploadPromises = fileBuffers.map((buf) =>
      processSingleUpload(buf, 'verifications', { maxSize: 10 * 1024 * 1024 })
    );
    return await Promise.all(uploadPromises);
  },

  /**
   * Upload review attachment photos
   */
  uploadReviewImages: async (fileBuffers) => {
    if (!Array.isArray(fileBuffers)) {
      return [await processSingleUpload(fileBuffers, 'reviews')];
    }
    const uploadPromises = fileBuffers.map((buf) => processSingleUpload(buf, 'reviews'));
    return await Promise.all(uploadPromises);
  },

  /**
   * Upload chat file attachments
   */
  uploadChatImages: async (fileBuffer) => {
    return await processSingleUpload(fileBuffer, 'chats');
  },

  /**
   * Upload roommate seeker profile photos
   */
  uploadRoommateImages: async (fileBuffer) => {
    return await processSingleUpload(fileBuffer, 'roommates');
  },

  /**
   * Deletes asset from media cloud
   */
  deleteImage: async (publicId) => {
    try {
      return await deleteImage(publicId);
    } catch (error) {
      throw new Error(`Failed to delete media asset: ${error.message}`);
    }
  },

  /**
   * Replaces an existing asset with a fresh upload
   */
  replaceImage: async (oldPublicId, newFileBuffer, folder) => {
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
      } catch (err) {
        console.warn(`Warning: Failed to delete previous image asset ${oldPublicId}`);
      }
    }
    return await processSingleUpload(newFileBuffer, folder);
  },
};

export default uploadService;
