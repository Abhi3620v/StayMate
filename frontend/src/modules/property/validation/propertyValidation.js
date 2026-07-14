import { z } from 'zod';
import { PROPERTY_TYPES, LISTING_TYPES } from '../constants/propertyConstants.js';

// Basic Info Validation Schema
export const basicInfoFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  propertyType: z.nativeEnum(PROPERTY_TYPES, { errorMap: () => ({ message: 'Please select a valid property type' }) }),
  listingType: z.nativeEnum(LISTING_TYPES, { errorMap: () => ({ message: 'Please select a valid listing type' }) }),
  occupancy: z.enum(['single', 'double', 'triple', 'four_sharing']).optional()
});

// Location Validation Schema
export const locationFormSchema = z.object({
  country: z.string().default('India'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area / Locality is required'),
  landmark: z.string().optional().nullable(),
  pinCode: z.string().regex(/^\d{6}$/, 'Pin code must be exactly 6 digits'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable()
});

// Pricing Validation Schema
export const pricingFormSchema = z.object({
  monthlyRent: z.number({ invalid_type_error: 'Rent must be a number' }).min(0, 'Rent must be positive'),
  securityDeposit: z.number({ invalid_type_error: 'Deposit must be a number' }).min(0, 'Deposit must be positive').optional(),
  maintenanceCharges: z.number({ invalid_type_error: 'Maintenance must be a number' }).min(0, 'Maintenance must be positive').optional(),
  brokerage: z.number({ invalid_type_error: 'Brokerage must be a number' }).min(0, 'Brokerage must be positive').optional(),
  electricityIncluded: z.boolean().default(false),
  waterIncluded: z.boolean().default(false),
  internetIncluded: z.boolean().default(false)
});

// Room Details Validation Schema
export const roomDetailsFormSchema = z.object({
  bedrooms: z.number().int().min(0, 'Bedrooms cannot be negative').default(1),
  bathrooms: z.number().int().min(0, 'Bathrooms cannot be negative').default(1),
  balcony: z.number().int().min(0, 'Balcony count cannot be negative').default(0),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  areaSqFt: z.number().min(0, 'Area must be positive').optional(),
  furnishing: z.enum(['fully_furnished', 'semi_furnished', 'unfurnished']).default('unfurnished')
});

// Merged Step 3 Schema (Pricing + Room Details)
export const stepThreeFormSchema = pricingFormSchema.merge(roomDetailsFormSchema);

// Amenities Validation Schema
export const amenitiesFormSchema = z.object({
  ac: z.boolean().default(false),
  wifi: z.boolean().default(false),
  powerBackup: z.boolean().default(false),
  parking: z.boolean().default(false),
  lift: z.boolean().default(false),
  laundry: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  gym: z.boolean().default(false),
  swimmingPool: z.boolean().default(false),
  security: z.boolean().default(false),
  cctv: z.boolean().default(false),
  housekeeping: z.boolean().default(false),
  foodIncluded: z.boolean().default(false)
});

// Media Image Validation Schema
export const mediaFormSchema = z.object({
  images: z.array(z.object({
    publicId: z.string().min(1),
    url: z.string().url(),
    isPrimary: z.boolean().default(false)
  })).min(1, 'At least one image is required')
});

// Combined Composite Listing Schema
export const propertyCompositeSchema = z.object({
  basicInfo: basicInfoFormSchema,
  location: locationFormSchema,
  pricing: pricingFormSchema,
  roomDetails: roomDetailsFormSchema,
  amenities: amenitiesFormSchema,
  media: mediaFormSchema
});
