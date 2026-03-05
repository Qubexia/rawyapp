/**
 * Zod validation schemas for podcast forms.
 */

import { z } from 'zod';

// ─── Create Podcast ─────────────────────────────────────────────────────────

export const createPodcastSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .default(''),
});

export type CreatePodcastFormData = z.input<typeof createPodcastSchema>;

// ─── Update Podcast ─────────────────────────────────────────────────────────

export const updatePodcastSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .transform((v) => v.trim())
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
});

export type UpdatePodcastFormData = z.infer<typeof updatePodcastSchema>;
