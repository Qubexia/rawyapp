/**
 * Episodes service — CRUD operations for episodes.
 */

import axiosClient, { UPLOAD_TIMEOUT } from './axios-client';
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
  /** 'external' = synced from RSS, 'internal' = uploaded on Rawy */
  source?: 'external' | 'internal';
  /** Per-episode artwork URL (mainly for external episodes from RSS) */
  artworkUrl?: string;
  /** Unique RSS GUID for deduplication */
  guid?: string;
  /** Original publish date from RSS feed */
  pubDate?: string;
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
  imageFile?: { uri: string; name: string; type: string } | null,
  onUploadProgress?: (progressEvent: any) => void
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

  if (imageFile) {
    formData.append('imageFile', {
      uri: imageFile.uri,
      name: imageFile.name,
      type: imageFile.type,
    } as unknown as Blob);
  }

  const { data } = await axiosClient.post<Episode>('/episodes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT,
    onUploadProgress,
  });
  return data;
}

/**
 * Create an episode from an in-app recording.
 * Converts the local recording URI into a FormData-compatible blob
 * and calls the same POST /episodes endpoint used by file-pick uploads.
 *
 * @param payload  Episode metadata (title, description, podcastId, duration).
 * @param recordingUri  Local file URI from expo-audio (e.g. file:///…/recording.m4a).
 * @param imageFile  Optional cover image picked by the creator.
 * @param onUploadProgress  Optional Axios progress callback.
 */
export async function createRecordingEpisode(
  payload: {
    title: string;
    description?: string;
    podcastId: string;
    duration?: number;
  },
  recordingUri: string,
  imageFile?: { uri: string; name: string; type: string } | null,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<Episode> {
  // Derive a filename from the URI; default to .m4a (expo-audio default output)
  const uriParts = recordingUri.split('/');
  const fileName = uriParts[uriParts.length - 1] || 'recording.m4a';

  const audioFile = {
    uri: recordingUri,
    name: fileName,
    type: 'audio/mp4', // M4A MIME type
  };

  return createEpisode(payload, audioFile, imageFile, onUploadProgress);
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
