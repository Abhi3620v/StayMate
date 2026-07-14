/**
 * Feature Flags Configuration registry for StayMate Listings
 */

export const PROPERTY_FEATURES = {
  FEATURED: 'featured',
  VERIFIED: 'verified',
  PREMIUM: 'premium',
  BOOSTED: 'boosted',
  RECOMMENDED: 'recommended',
  SPONSORED: 'sponsored'
};

export const DEFAULT_FEATURES_STATE = {
  [PROPERTY_FEATURES.FEATURED]: false,
  [PROPERTY_FEATURES.VERIFIED]: false,
  [PROPERTY_FEATURES.PREMIUM]: false,
  [PROPERTY_FEATURES.BOOSTED]: false,
  [PROPERTY_FEATURES.RECOMMENDED]: false,
  [PROPERTY_FEATURES.SPONSORED]: false
};

export default PROPERTY_FEATURES;
