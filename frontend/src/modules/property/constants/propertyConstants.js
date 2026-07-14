/**
 * Frontend Centralized Property Constants
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
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'wifi', label: 'High-speed Wi-Fi' },
  { id: 'powerBackup', label: 'Power Backup' },
  { id: 'parking', label: 'Parking Space' },
  { id: 'lift', label: 'Elevator / Lift' },
  { id: 'laundry', label: 'Laundry Facility' },
  { id: 'kitchen', label: 'Equipped Kitchen' },
  { id: 'gym', label: 'Gym / Fitness Center' },
  { id: 'swimmingPool', label: 'Swimming Pool' },
  { id: 'security', label: 'Security Staff' },
  { id: 'cctv', label: 'CCTV Surveillance' },
  { id: 'housekeeping', label: 'Housekeeping Services' },
  { id: 'foodIncluded', label: 'Meals / Food Included' }
];
