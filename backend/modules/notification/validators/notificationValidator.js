import { z } from 'zod';

const ChannelToggleSchema = z.object({
  inApp: z.boolean().default(true),
  email: z.boolean().default(true),
  push: z.boolean().optional().default(false),
});

export const updatePreferencesSchema = z.object({
  categories: z.object({
    property: ChannelToggleSchema.optional(),
    roommate: ChannelToggleSchema.optional(),
    visit: ChannelToggleSchema.optional(),
    chat: ChannelToggleSchema.optional(),
    review: ChannelToggleSchema.optional(),
    security: ChannelToggleSchema.optional(),
    announcements: ChannelToggleSchema.optional(),
  }).optional(),
});

export const broadcastAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must contain at least 3 characters').max(100),
  message: z.string().min(5, 'Message must contain at least 5 characters').max(500),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional().default('medium'),
  icon: z.string().optional().default('bell'),
});
