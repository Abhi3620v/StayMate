import { z } from 'zod';

export const locationSchema = z.object({
  country: z.string().default('India'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  area: z.string().min(1, 'Area is required'),
  landmark: z.string().optional().default(''),
  pinCode: z.string().regex(/^[0-9]{6}$/, 'PIN Code must be a 6-digit number'),
  latitude: z.number().optional().default(28.6139),
  longitude: z.number().optional().default(77.2090),
  googlePlaceId: z.string().optional().default(''),
});

export const pricingSchema = z.object({
  monthlyRent: z.number().min(0, 'Monthly rent must be a positive number'),
  securityDeposit: z.number().min(0, 'Security deposit must be positive').optional().default(0),
  maintenanceCharges: z.number().min(0, 'Maintenance charges must be positive').optional().default(0),
  brokerage: z.number().min(0, 'Brokerage must be positive').optional().default(0),
  electricityIncluded: z.boolean().optional().default(false),
  waterIncluded: z.boolean().optional().default(false),
  internetIncluded: z.boolean().optional().default(false),
});

export const roomDetailsSchema = z.object({
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative'),
  balcony: z.boolean().optional().default(false),
  floor: z.number().optional().default(0),
  totalFloors: z.number().optional().default(0),
  areaSqFt: z.number().optional().default(0),
  furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished']).default('unfurnished'),
});

export const amenitiesSchema = z.object({
  ac: z.boolean().optional().default(false),
  wifi: z.boolean().optional().default(false),
  powerBackup: z.boolean().optional().default(false),
  parking: z.boolean().optional().default(false),
  lift: z.boolean().optional().default(false),
  laundry: z.boolean().optional().default(false),
  kitchen: z.boolean().optional().default(false),
  gym: z.boolean().optional().default(false),
  swimmingPool: z.boolean().optional().default(false),
  security: z.boolean().optional().default(false),
  cctv: z.boolean().optional().default(false),
  housekeeping: z.boolean().optional().default(false),
  foodIncluded: z.boolean().optional().default(false),
});

export const imageItemSchema = z.object({
  publicId: z.string(),
  url: z.string().url('Invalid image URL'),
  isPrimary: z.boolean().optional().default(false),
});

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(5, 'Title must contain at least 5 characters').max(100),
  description: z.string().trim().min(10, 'Description must contain at least 10 characters'),
  propertyType: z.enum(['apartment', 'flat', 'pg', 'hostel', 'independent_house', 'villa', 'studio', 'room']),
  listingType: z.enum(['rent', 'lease', 'shared']),
  location: locationSchema,
  pricing: pricingSchema,
  roomDetails: roomDetailsSchema,
  amenities: amenitiesSchema.optional(),
  images: z.array(imageItemSchema).min(1, 'Please upload at least one image listing'),
  occupancy: z.enum(['single', 'double', 'triple', 'four_sharing']).optional().default('single'),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
});
