/**
 * Creators service — creator profiles and management.
 */

import axiosClient from './axios-client';
import type { PaginatedResponse } from './podcasts.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreatorProfile {
  _id: string;
  userId: string;
  name: string;
  showName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  followerCount: number;
  podcastCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BecomeCreatorPayload {
  showName?: string;
}

export interface UpdateCreatorProfilePayload {
  bio?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getCreators(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<CreatorProfile>> {
  const { data } = await axiosClient.get<PaginatedResponse<CreatorProfile>>(
    '/creators',
    { params: { page, limit } },
  );
  return data;
}

export async function getTopCreators(
  limit = 10,
): Promise<CreatorProfile[]> {
  const { data } = await axiosClient.get<CreatorProfile[]>(
    '/creators/top',
    { params: { limit } },
  );
  return data ?? [];
}

export async function getCreator(id: string): Promise<CreatorProfile> {
  const { data } = await axiosClient.get<CreatorProfile>(`/creators/${id}`);
  return data;
}

export async function getMyCreatorProfile(): Promise<CreatorProfile> {
  const { data } = await axiosClient.get<CreatorProfile>('/creators/me');
  return data;
}

export async function becomeCreator(
  payload: BecomeCreatorPayload,
): Promise<CreatorProfile> {
  const { data } = await axiosClient.post<CreatorProfile>(
    '/creators/become',
    payload,
  );
  return data;
}

export async function updateCreatorProfile(
  payload: UpdateCreatorProfilePayload,
  avatar?: { uri: string; name: string; type: string },
): Promise<CreatorProfile> {
  const formData = new FormData();
  if (payload.bio) formData.append('bio', payload.bio);
  if (payload.socialLinks) {
    formData.append('socialLinks', JSON.stringify(payload.socialLinks));
  }

  if (avatar) {
    formData.append('avatar', {
      uri: avatar.uri,
      name: avatar.name,
      type: avatar.type,
    } as unknown as Blob);
  }

  const { data } = await axiosClient.patch<CreatorProfile>(
    '/creators/me',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}
