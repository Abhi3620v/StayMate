import { z } from 'zod';

/**
 * Validator schema for user registration requests
 */
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters'),
  email: z.string().trim().email('Please provide a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['tenant', 'owner']).default('tenant'),
});

/**
 * Validator schema for user login requests
 */
export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Validator schema for updating user password
 */
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * Validator schema for profile edits
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters').optional(),
  username: z.string().trim().min(3, 'Username must contain at least 3 characters').optional(),
  phone: z.string().trim().regex(/^\+?[0-9]{10,14}$/, 'Please provide a valid phone number').or(z.literal('')).optional().nullable(),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional().nullable(),
  avatar: z.string().url('Avatar must be a valid URL string').optional().nullable(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      language: z.string().optional(),
      notificationPreferences: z.object({
        emailMatches: z.boolean().optional(),
        pushAlerts: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
      }).optional(),
      accessibilitySettings: z.object({
        highContrast: z.boolean().optional(),
        largeText: z.boolean().optional(),
      }).optional(),
    })
    .optional(),
});
