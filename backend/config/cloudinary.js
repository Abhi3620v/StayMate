import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Check if Cloudinary is running in mock sandbox mode
const isMockMode =
  !process.env.CLOUDINARY_NAME ||
  process.env.CLOUDINARY_NAME === 'cloudinary_name_placeholder_value';

if (!isMockMode) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
  console.log('☁️ [Cloudinary Status] Connected in Production mode.');
} else {
  console.log('☁️ [Cloudinary Status] Running in Sandbox mode. Mock uploads will be saved to local public folder.');
}

// Multer Memory Storage Configuration
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

/**
 * Uploads buffer data to Cloudinary (or returns mock URL if in development sandbox)
 *
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} { publicId, url }
 */
export const uploadImage = async (fileBuffer, folder = 'staymate') => {
  if (isMockMode) {
    try {
      const uploadsDir = path.resolve('..', 'frontend', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filename = `avatar_${Date.now()}.png`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, fileBuffer);

      const mockUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/uploads/${filename}`;
      return {
        publicId: `mock_public_id_${Date.now()}`,
        url: mockUrl,
      };
    } catch (err) {
      console.error('Local mock upload save failed:', err.message);
      // Fallback SVG if save fails
      return {
        publicId: `mock_public_id_${Date.now()}`,
        url: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMGVhNWU5Ij48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIvPjxwYXRoIGQ9Ik01MCAyMGExOCAxOCAwIDEgMCAxOCAxOCAxOCAxOCAwIDAgMC0xOC0xOHptMCA0NmMtMjIgMC0zNiAxMC0zNiAyMnY0aDcydi00YzAtMTItMTQtMjItMzYtMjJ6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==`,
      };
    }
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          publicId: result.public_id,
          url: result.secure_url,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes asset from Cloudinary (ignored in mock mode)
 * @param {string} publicId - Asset ID
 */
export const deleteImage = async (publicId) => {
  if (isMockMode || publicId.startsWith('mock_')) return true;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};
