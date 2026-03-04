/**
 * Likes service — like/unlike episodes + status check.
 */

import axiosClient from './axios-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LikeResult {
  message: string;
  likesCount: number;
}

export interface LikeStatus {
  isLiked: boolean;
  likesCount: number;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function likeEpisode(episodeId: string): Promise<LikeResult> {
  const { data } = await axiosClient.post<LikeResult>(
    `/likes/episodes/${episodeId}`,
  );
  return data;
}

export async function unlikeEpisode(episodeId: string): Promise<LikeResult> {
  const { data } = await axiosClient.delete<LikeResult>(
    `/likes/episodes/${episodeId}`,
  );
  return data;
}

export async function getLikeStatus(episodeId: string): Promise<LikeStatus> {
  const { data } = await axiosClient.get<LikeStatus>(
    `/likes/episodes/${episodeId}/status`,
  );
  return data;
}
