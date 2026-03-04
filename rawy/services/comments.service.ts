/**
 * Comments service — CRUD for episode comments.
 */

import axiosClient from './axios-client';
import type { PaginatedResponse } from './podcasts.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
  };
  episode: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getComments(
  episodeId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<Comment>> {
  const { data } = await axiosClient.get<PaginatedResponse<Comment>>(
    `/comments/episodes/${episodeId}`,
    { params: { page, limit } },
  );
  return data;
}

export async function createComment(
  episodeId: string,
  text: string,
): Promise<Comment> {
  const { data } = await axiosClient.post<Comment>(
    `/comments/episodes/${episodeId}`,
    { text },
  );
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await axiosClient.delete(`/comments/${commentId}`);
}
