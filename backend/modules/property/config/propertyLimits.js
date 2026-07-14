/**
 * System Constraints and Threshold Configuration for StayMate Listings
 */

export const PROPERTY_LIMITS = {
  MIN_RENT: 500,
  MAX_RENT: 1000000,
  MIN_DEPOSIT_MULTIPLIER: 0,
  MAX_DEPOSIT_MULTIPLIER: 12,
  MAX_IMAGES_COUNT: 20,
  MAX_DOCUMENTS_COUNT: 5,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_DOCUMENT_FORMATS: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE_BYTES: 10 * 1024 * 1024 // 10MB
};

export default PROPERTY_LIMITS;
