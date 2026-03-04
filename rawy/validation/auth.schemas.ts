/**
 * Zod validation schemas for authentication forms.
 */

import { z } from 'zod';

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Register (user) ────────────────────────────────────────────────────────

export const registerUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .transform((v) => v.trim()),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

// ─── Register (creator) ─────────────────────────────────────────────────────

export const registerCreatorSchema = registerUserSchema.extend({
  showName: z
    .string()
    .min(1, 'Show / Podcast name is required')
    .min(2, 'Show name must be at least 2 characters')
    .max(100, 'Show name must not exceed 100 characters')
    .transform((v) => v.trim()),
});

export type RegisterCreatorFormData = z.infer<typeof registerCreatorSchema>;

// ─── Comment ─────────────────────────────────────────────────────────────────

export const commentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must not exceed 1000 characters')
    .transform((v) => v.trim()),
});

export type CommentFormData = z.infer<typeof commentSchema>;

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

// ─── Create Episode ─────────────────────────────────────────────────────────

export const createEpisodeSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .default(''),
  podcastId: z.string().min(1, 'Please select a podcast'),
  duration: z.number().positive('Duration must be positive').optional(),
});

export type CreateEpisodeFormData = z.infer<typeof createEpisodeSchema>;
