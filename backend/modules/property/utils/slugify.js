import crypto from 'crypto';

/**
 * Generates a clean URL-safe, lowercase, hyphen-separated slug
 * Format: title-city-shortId
 * Example: "Luxury Flat" in "Delhi" -> "luxury-flat-delhi-a9f4d"
 */
export const generatePropertySlug = (title = '', city = '') => {
  const cleanTitle = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_]+/g, '-')   // replace spaces/underscores with hyphens
    .replace(/-+/g, '-');      // deduplicate hyphens

  const cleanCity = (city || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

  const shortId = crypto
    .randomBytes(3)
    .toString('hex'); // 6 character hex string

  return `${cleanTitle}-${cleanCity}-${shortId}`.replace(/^-+|-+$/g, '');
};

export default generatePropertySlug;
