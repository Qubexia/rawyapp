/**
 * Episodes service — CRUD operations for episodes.
 */

import axiosClient from './axios-client';
import type { PaginatedResponse } from './podcasts.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Episode {
  _id: string;
  title: string;
  description?: string;
  audioFileUrl: string;
  duration: number;
  podcast: {
    _id: string;
    title: string;
    coverImageUrl?: string;
  };
  creator: {
    _id: string;
    name: string;
  };
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getEpisodes(
  page = 1,
  limit = 20,
  podcastId?: string,
  creatorId?: string,
): Promise<PaginatedResponse<Episode>> {
  const params: Record<string, string | number> = { page, limit };
  if (podcastId) params.podcastId = podcastId;
  if (creatorId) params.creatorId = creatorId;

  const { data } = await axiosClient.get<PaginatedResponse<Episode>>('/episodes', { params });
  return data;
}

export async function getEpisode(id: string): Promise<Episode> {
  const { data } = await axiosClient.get<Episode>(`/episodes/${id}`);
  return data;
}

export async function createEpisode(
  payload: {
    title: string;
    description?: string;
    podcastId: string;
    duration?: number;
  },
  audioFile: { uri: string; name: string; type: string },
): Promise<Episode> {
  const formData = new FormData();
  formData.append('title', payload.title);
  if (payload.description) formData.append('description', payload.description);
  formData.append('podcastId', payload.podcastId);
  if (payload.duration) formData.append('duration', String(payload.duration));

  formData.append('audioFile', {
    uri: audioFile.uri,
    name: audioFile.name,
    type: audioFile.type,
  } as unknown as Blob);

  const { data } = await axiosClient.post<Episode>('/episodes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateEpisode(
  id: string,
  payload: { title?: string; description?: string },
): Promise<Episode> {
  const { data } = await axiosClient.patch<Episode>(`/episodes/${id}`, payload);
  return data;
}

export async function deleteEpisode(id: string): Promise<void> {
  await axiosClient.delete(`/episodes/${id}`);
}
