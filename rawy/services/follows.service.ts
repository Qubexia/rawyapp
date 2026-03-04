/**
 * Follows service — follow/unfollow creators, status, lists.
 */

import axiosClient from './axios-client';
import type { PaginatedResponse } from './podcasts.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FollowResult {
  message: string;
  followerCount: number;
}

export interface FollowStatus {
  isFollowing: boolean;
  followerCount: number;
}

export interface FollowedCreator {
  _id: string;
  name: string;
  avatar?: string;
  showName?: string;
}

export interface FollowerUser {
  _id: string;
  name: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function followCreator(creatorId: string): Promise<FollowResult> {
  const { data } = await axiosClient.post<FollowResult>(
    `/follows/creators/${creatorId}`,
  );
  return data;
}

export async function unfollowCreator(creatorId: string): Promise<FollowResult> {
  const { data } = await axiosClient.delete<FollowResult>(
    `/follows/creators/${creatorId}`,
  );
  return data;
}

export async function getFollowStatus(creatorId: string): Promise<FollowStatus> {
  const { data } = await axiosClient.get<FollowStatus>(
    `/follows/creators/${creatorId}/status`,
  );
  return data;
}

export async function getFollowing(
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<FollowedCreator>> {
  const { data } = await axiosClient.get<PaginatedResponse<FollowedCreator>>(
    '/follows/me/following',
    { params: { page, limit } },
  );
  return data;
}

export async function getFollowers(
  creatorId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<FollowerUser>> {
  const { data } = await axiosClient.get<PaginatedResponse<FollowerUser>>(
    `/follows/creators/${creatorId}/followers`,
    { params: { page, limit } },
  );
  return data;
}
