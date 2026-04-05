/**
 * Podcasts service — CRUD operations for podcasts.
 */

import axiosClient, { UPLOAD_TIMEOUT } from './axios-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Podcast {
  _id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  category?: string;
  creator: {
    _id: string;
    name: string;
    avatarUrl?: string;
    avatar?: string;
  };
  episodeCount: number;
  subscriberCount: number;
  /** 'external' = synced from RSS, 'internal' = hosted on Rawy */
  source?: 'external' | 'internal';
  /** Whether RSS auto-sync is enabled (external only) */
  autoSync?: boolean;
  /** RSS feed URL for external podcasts */
  feedUrl?: string;
  /** Apple Podcasts ID for external podcasts */
  appleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getPodcasts(
  page = 1,
  limit = 20,
  creatorId?: string,
  search?: string,
  category?: string,
): Promise<PaginatedResponse<Podcast>> {
  const params: Record<string, string | number> = { page, limit };
  if (creatorId) params.creatorId = creatorId;
  if (search?.trim()) params.search = search.trim();
  if (category?.trim() && category !== 'All') params.category = category.trim();

  const { data } = await axiosClient.get<PaginatedResponse<Podcast>>('/podcasts', { params });
  return data;
}

export async function getPodcast(id: string): Promise<Podcast> {
  const { data } = await axiosClient.get<Podcast>(`/podcasts/${id}`);
  return data;
}

export async function resolvePodcast(appleId: string): Promise<Podcast> {
  const { data } = await axiosClient.get<Podcast>(`/podcasts/resolve/${appleId}`);
  return data;
}

export async function createPodcast(
  payload: { title: string; description?: string },
  coverImage?: { uri: string; name: string; type: string },
): Promise<Podcast> {
  const formData = new FormData();
  formData.append('title', payload.title);
  if (payload.description) formData.append('description', payload.description);

  if (coverImage) {
    formData.append('coverImage', {
      uri: coverImage.uri,
      name: coverImage.name,
      type: coverImage.type,
    } as unknown as Blob);
  }

  const { data } = await axiosClient.post<Podcast>('/podcasts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  });
  return data;
}

export async function updatePodcast(
  id: string,
  payload: { title?: string; description?: string },
  coverImage?: { uri: string; name: string; type: string },
): Promise<Podcast> {
  const formData = new FormData();
  if (payload.title) formData.append('title', payload.title);
  if (payload.description) formData.append('description', payload.description);

  if (coverImage) {
    formData.append('coverImage', {
      uri: coverImage.uri,
      name: coverImage.name,
      type: coverImage.type,
    } as unknown as Blob);
  }

  const { data } = await axiosClient.patch<Podcast>(`/podcasts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
  });
  return data;
}

export async function deletePodcast(id: string): Promise<void> {
  await axiosClient.delete(`/podcasts/${id}`);
}

// ─── Subscription API calls ──────────────────────────────────────────────────

export async function subscribeToPodcast(id: string): Promise<void> {
  await axiosClient.post(`/podcasts/${id}/subscribe`);
}

export async function unsubscribeFromPodcast(id: string): Promise<void> {
  await axiosClient.delete(`/podcasts/${id}/subscribe`);
}

// ─── Sync API calls ─────────────────────────────────────────────────────────

export async function syncPodcast(id: string): Promise<{ message: string }> {
  const { data } = await axiosClient.patch<{ message: string }>(`/podcasts/${id}/sync`);
  return data;
}
