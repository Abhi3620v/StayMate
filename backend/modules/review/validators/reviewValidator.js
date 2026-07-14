import { z } from 'zod';

export const createReviewSchema = z.object({
  category: z.enum(['property', 'owner', 'roommate']),
  rating: z.number().min(1).max(5),
  ratings: z.record(z.number().min(1).max(5)).optional().default({}),
  title: z.string().max(150).optional(),
  content: z.string().min(5, 'Review content must contain at least 5 characters').max(2000),
  images: z.array(
    z.object({
      url: z.string().url('Invalid image URL format'),
      caption: z.string().optional().default(''),
    })
  ).optional().default([]),
  isAnonymous: z.boolean().optional().default(false),
  recommend: z.boolean().optional(),
  
  // Dynamic Target IDs
  propertyId: z.string().optional(),
  ownerId: z.string().optional(),
  roommateId: z.string().optional(),
  
  // Gating IDs
  visitId: z.string().optional(),
  matchId: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  ratings: z.record(z.number().min(1).max(5)).optional(),
  title: z.string().max(150).optional(),
  content: z.string().min(5, 'Review content must contain at least 5 characters').max(2000).optional(),
  images: z.array(
    z.object({
      url: z.string().url('Invalid image URL format'),
      caption: z.string().optional().default(''),
    })
  ).optional(),
  isAnonymous: z.boolean().optional(),
  recommend: z.boolean().optional(),
});

export const replyReviewSchema = z.object({
  content: z.string().min(1, 'Reply content cannot be empty').max(1000),
});

export const reportReviewSchema = z.object({
  reason: z.enum(['spam', 'fake_review', 'abusive_language', 'harassment', 'irrelevant_content', 'other']),
  explanation: z.string().min(5, 'Please provide an explanation of at least 5 characters').max(500),
});
