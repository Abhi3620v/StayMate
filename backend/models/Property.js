import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'flat', 'pg', 'hostel', 'independent_house', 'villa', 'studio', 'room'],
      required: true,
      index: true,
    },
    listingType: {
      type: String,
      enum: ['rent', 'lease', 'shared'],
      required: true,
      index: true,
    },
    location: {
      country: { type: String, default: 'India' },
      state: { type: String, required: true },
      city: { type: String, required: true, index: true },
      area: { type: String, required: true, index: true },
      landmark: { type: String, default: '' },
      pinCode: { type: String, required: true },
      latitude: { type: Number, default: 28.6139 }, // Noida/Delhi default
      longitude: { type: Number, default: 77.2090 },
      googlePlaceId: { type: String, default: '' },
    },
    pricing: {
      monthlyRent: { type: Number, required: true, min: 0, index: true },
      securityDeposit: { type: Number, default: 0, min: 0 },
      maintenanceCharges: { type: Number, default: 0, min: 0 },
      brokerage: { type: Number, default: 0, min: 0 },
      electricityIncluded: { type: Boolean, default: false },
      waterIncluded: { type: Boolean, default: false },
      internetIncluded: { type: Boolean, default: false },
    },
    availability: {
      availableFrom: { type: Date, default: Date.now },
      minimumStay: { type: Number, default: 1 }, // in months
      maximumStay: { type: Number, default: 12 },
    },
    occupancy: {
      type: String,
      enum: ['single', 'double', 'triple', 'four_sharing'],
      default: 'single',
    },
    roomDetails: {
      bedrooms: { type: Number, required: true, min: 0, index: true },
      bathrooms: { type: Number, required: true, min: 0 },
      balcony: { type: Number, default: 0 },
      floor: { type: Number, default: 0 },
      totalFloors: { type: Number, default: 0 },
      areaSqFt: { type: Number, default: 0 },
      furnishing: {
        type: String,
        enum: ['unfurnished', 'semi_furnished', 'fully_furnished'],
        default: 'unfurnished',
      },
    },
    amenities: {
      ac: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      lift: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      kitchen: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      swimmingPool: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      housekeeping: { type: Boolean, default: false },
      foodIncluded: { type: Boolean, default: false },
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    images: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'image' },
        displayOrder: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    documents: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'pdf' },
        displayOrder: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    videos: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'video' },
        displayOrder: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    floorPlans: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'floor_plan' },
        displayOrder: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'archived', 'rejected', 'suspended', 'soft_deleted', 'expired'],
      default: 'draft',
      index: true
    },
    features: {
      featured: { type: Boolean, default: false },
      verified: { type: Boolean, default: false },
      premium: { type: Boolean, default: false },
      boosted: { type: Boolean, default: false },
      recommended: { type: Boolean, default: false },
      sponsored: { type: Boolean, default: false }
    },
    statistics: {
      views: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
      visitRequests: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 } // in minutes
    },
    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      publishedAt: { type: Date },
      archivedAt: { type: Date },
      deletedAt: { type: Date },
      lastViewedAt: { type: Date },
      lastEditedAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    version: {
      versionNumber: { type: Number, default: 1 },
      lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      lastModifiedAt: { type: Date, default: Date.now },
      previousVersionReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for optimal filtering
propertySchema.index({ 'location.city': 1, status: 1, 'pricing.monthlyRent': 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
