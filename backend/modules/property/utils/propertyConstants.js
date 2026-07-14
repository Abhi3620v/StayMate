/**
 * Centralized Property Module Constants for StayMate
 */

export const PROPERTY_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
  EXPIRED: 'expired'
};

export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  FLAT: 'flat',
  HOUSE: 'independent_house',
  VILLA: 'villa',
  PG: 'pg',
  HOSTEL: 'hostel',
  ROOM: 'room',
  STUDIO: 'studio',
  ROOMMATE_LISTING: 'roommate_listing'
};

export const LISTING_TYPES = {
  ENTIRE_PROPERTY: 'rent',
  PRIVATE_ROOM: 'lease',
  SHARED_ROOM: 'shared'
};

export const AMENITIES_LIST = [
  'ac', 'wifi', 'powerBackup', 'parking', 'lift', 'laundry',
  'kitchen', 'gym', 'swimmingPool', 'security', 'cctv',
  'housekeeping', 'foodIncluded'
];
