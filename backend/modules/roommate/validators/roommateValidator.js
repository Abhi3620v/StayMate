import { z } from 'zod';

export const roommateProfileSchema = z.object({
  basicInfo: z.object({
    occupation: z.enum(['student', 'professional'], {
      required_error: 'Occupation is required',
    }),
    collegeOrCompany: z.string().trim().min(2, 'College or Company name must contain at least 2 characters'),
    age: z.number().min(18, 'You must be at least 18 years old to use Roommate Finder').max(100, 'Invalid age'),
    gender: z.enum(['male', 'female', 'other'], {
      required_error: 'Gender is required',
    }),
    bio: z.string().trim().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio must be under 1000 characters'),
  }),
  lifestyle: z.object({
    sleepingSchedule: z.enum(['early_bird', 'night_owl', 'flexible']),
    wakeUpTime: z.string().trim().min(1, 'Wake up time is required'),
    foodPreference: z.enum(['veg', 'non-veg', 'any']),
    smoking: z.boolean(),
    drinking: z.boolean(),
    pets: z.boolean(),
    guests: z.boolean(),
    cleanliness: z.enum(['high', 'moderate', 'low']),
    noisePreference: z.enum(['quiet', 'moderate', 'loud']),
    studyEnvironment: z.enum(['quiet', 'group', 'flexible']),
    workFromHome: z.boolean(),
    socialLifestyle: z.enum(['introvert', 'extrovert', 'moderate']),
  }),
  budget: z.object({
    monthlyRent: z.number().nonnegative('Rent must be a positive number'),
    securityDeposit: z.number().nonnegative('Security deposit must be positive'),
    propertyType: z.enum(['apartment', 'flat', 'pg', 'hostel', 'independent_house', 'villa', 'studio', 'room', 'any']),
    listingType: z.enum(['rent', 'lease', 'shared', 'any']),
  }),
  locationPreferences: z.object({
    city: z.string().trim().min(1, 'Preferred city is required'),
    area: z.string().trim().min(1, 'Preferred area is required'),
    maxDistance: z.number().nonnegative().default(10),
  }),
  languagesSpoken: z.array(z.string().trim()).min(1, 'Please specify at least one spoken language'),
  hobbies: z.array(z.string().trim()).default([]),
  interests: z.array(z.string().trim()).default([]),
  moveInDate: z.string().or(z.date()).transform((val) => new Date(val)),
  maxRoommates: z.number().min(1).default(1),
  visibility: z.enum(['public', 'private', 'only_logged_in']).default('public'),
  profilePicture: z.string().optional().default(''),
});

export const requestCreateSchema = z.object({
  receiverId: z.string().min(1, 'Receiver user ID is required'),
  message: z.string().trim().max(500, 'Message must be under 500 characters').optional().default(''),
});

export const reportCreateSchema = z.object({
  roommateId: z.string().min(1, 'Roommate profile ID is required'),
  reason: z.enum(['Spam', 'Fake Profile', 'Harassment', 'Inappropriate Information', 'Duplicate Profile', 'Other']),
  description: z.string().trim().max(1000, 'Description must be under 1000 characters').optional().default(''),
});

export const resolveReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  resolutionNotes: z.string().trim().min(5, 'Resolution notes must be at least 5 characters'),
});
