import { z } from 'zod';
import { PROPERTY_TYPES, LISTING_TYPES, PROPERTY_STATUS } from '../utils/propertyConstants.js';

// 1. Basic Info Sub-Schema
export const basicInfoSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  propertyType: z.nativeEnum(PROPERTY_TYPES),
  listingType: z.nativeEnum(LISTING_TYPES),
  occupancy: z.enum(['single', 'double', 'triple', 'four_sharing']).optional()
});

// 2. Location Sub-Schema
export const locationSchema = z.object({
  country: z.string().default('India'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  landmark: z.string().optional().nullable(),
  pinCode: z.string().regex(/^\d{6}$/, 'Pin code must be exactly 6 digits'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  googlePlaceId: z.string().optional().nullable()
});

// 3. Pricing Sub-Schema
export const pricingSchema = z.object({
  monthlyRent: z.number().min(0, 'Rent must be positive').nullable(),
  securityDeposit: z.number().min(0, 'Deposit must be positive').optional().nullable(),
  maintenanceCharges: z.number().min(0, 'Maintenance must be positive').optional().nullable(),
  brokerage: z.number().min(0, 'Brokerage must be positive').optional().nullable(),
  electricityIncluded: z.boolean().default(false),
  waterIncluded: z.boolean().default(false),
  internetIncluded: z.boolean().default(false)
});

// 4. Room Details Sub-Schema
export const roomDetailsSchema = z.object({
  bedrooms: z.number().int().min(0).nullable().default(0),
  bathrooms: z.number().int().min(0).nullable().default(0),
  balcony: z.number().int().min(0).nullable().default(0),
  floor: z.number().int().optional().nullable(),
  totalFloors: z.number().int().optional().nullable(),
  areaSqFt: z.number().min(0).optional().nullable(),
  furnishing: z.enum(['fully_furnished', 'semi_furnished', 'unfurnished']).default('unfurnished')
});

// 5. Amenities Sub-Schema (13 boolean flags)
export const amenitiesSchema = z.object({
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

// 6. Media Item Sub-Schema
export const imageItemSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
  url: z.string().url('Must be a valid image URL'),
  isPrimary: z.boolean().default(false)
});

// Composite validation schema for creating a property listing
export const propertyCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  propertyType: z.nativeEnum(PROPERTY_TYPES),
  listingType: z.nativeEnum(LISTING_TYPES),
  occupancy: z.enum(['single', 'double', 'triple', 'four_sharing']).optional(),
  location: locationSchema,
  pricing: pricingSchema,
  roomDetails: roomDetailsSchema,
  amenities: amenitiesSchema.optional(),
  images: z.array(imageItemSchema).min(1, 'At least one image is required'),
  status: z.nativeEnum(PROPERTY_STATUS).default(PROPERTY_STATUS.DRAFT)
});

// Partial schema validation helper for saving draft listings (loose checks)
export const propertyDraftSchema = propertyCreateSchema.extend({
  images: z.array(imageItemSchema).optional()
}).deepPartial();

export const validatePropertyInput = (data, isDraft = false) => {
  const schema = isDraft ? propertyDraftSchema : propertyCreateSchema;
  return schema.safeParse(data);
};
