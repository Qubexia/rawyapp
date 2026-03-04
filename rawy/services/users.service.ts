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
