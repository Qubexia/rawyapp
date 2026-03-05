/**
 * Users service — current user profile and device token management.
 */

import axiosClient from './axios-client';
import type { UserProfile } from './auth.service';

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getMe(): Promise<UserProfile> {
  const { data } = await axiosClient.get<UserProfile>('/users/me');
  return data;
}

export async function updateMe(
  payload: Partial<{ name: string }>,
): Promise<UserProfile> {
  const { data } = await axiosClient.patch<UserProfile>('/users/me', payload);
  return data;
}

export async function addDeviceToken(token: string): Promise<void> {
  await axiosClient.post('/users/me/device-token', { token });
}

export async function removeDeviceToken(token: string): Promise<void> {
  await axiosClient.delete('/users/me/device-token', { data: { token } });
}

export async function updateAvatar(image: { uri: string; name: string; type: string }): Promise<UserProfile> {
  const formData = new FormData();
  // @ts-ignore - FormData expects string | Blob, but RN needs uri/name/type object
  formData.append('avatar', {
    uri: image.uri,
    name: image.name,
    type: image.type,
  });

  const { data } = await axiosClient.patch<UserProfile>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
export interface PublicUser {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export async function getPublicProfile(id: string): Promise<PublicUser> {
  const { data } = await axiosClient.get<PublicUser>(`/users/${id}/public`);
  return data;
}
