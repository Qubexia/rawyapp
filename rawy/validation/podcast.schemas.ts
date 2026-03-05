/**
 * Zod validation schemas for podcast forms.
 */

import { z } from 'zod';

// ─── Create Podcast ─────────────────────────────────────────────────────────

export const createPodcastSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must not exceed 100 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description must not exceed 2000 characters'),
});

export type CreatePodcastFormData = z.input<typeof createPodcastSchema>;

// ─── Update Podcast ─────────────────────────────────────────────────────────

export const updatePodcastSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must not exceed 100 characters')
    .transform((v) => v.trim())
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
});

export type UpdatePodcastFormData = z.infer<typeof updatePodcastSchema>;
