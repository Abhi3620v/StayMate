import { PROPERTY_STATUS } from '../config/propertyWorkflow.js';
import { DEFAULT_FEATURES_STATE } from '../config/propertyFeatures.js';

export const createDefaultStatistics = () => ({
  views: 0,
  favorites: 0,
  visitRequests: 0,
  shares: 0,
  impressions: 0,
  clickThroughRate: 0,
  conversionRate: 0,
  averageResponseTime: 0
});

export const createDefaultMetadata = (userId) => {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
    lastViewedAt: null,
    lastEditedAt: now,
    createdBy: userId,
    updatedBy: userId,
    publishedBy: null,
    archivedBy: null,
    deletedBy: null
  };
};

export const createDefaultVersion = (userId) => ({
  versionNumber: 1,
  lastModifiedBy: userId,
  lastModifiedAt: new Date(),
  previousVersionReference: null
});

export const createNewPropertyDefaults = (userId) => ({
  status: PROPERTY_STATUS.DRAFT,
  features: { ...DEFAULT_FEATURES_STATE },
  statistics: createDefaultStatistics(),
  metadata: createDefaultMetadata(userId),
  version: createDefaultVersion(userId),
  images: [],
  documents: [],
  videos: [],
  floorPlans: [],
  location: {
    country: 'India',
    state: 'Draft',
    city: 'Draft',
    area: 'Draft',
    pinCode: '000000'
  },
  pricing: {
    monthlyRent: 0,
    securityDeposit: 0,
    maintenanceCharges: 0,
    brokerage: 0
  },
  roomDetails: {
    bedrooms: 0,
    bathrooms: 0,
    balcony: 0,
    floor: 0,
    totalFloors: 0,
    areaSqFt: 0
  }
});
