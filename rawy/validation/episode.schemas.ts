/**
 * Zod validation schemas for episode forms.
 */

import { z } from 'zod';

// ─── Create Episode ─────────────────────────────────────────────────────────

export const createEpisodeSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(200, 'Title must not exceed 200 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description must not exceed 5000 characters'),
  podcastId: z.string().min(1, 'Please select a podcast'),
  duration: z.number().positive('Duration must be positive').optional(),
});

export type CreateEpisodeFormData = z.infer<typeof createEpisodeSchema>;

// ─── Update Episode ─────────────────────────────────────────────────────────

export const updateEpisodeSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(200, 'Title must not exceed 200 characters')
    .transform((v) => v.trim())
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),
});

export type UpdateEpisodeFormData = z.infer<typeof updateEpisodeSchema>;
