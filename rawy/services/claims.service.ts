/**
 * Claims service — podcast ownership claiming and verification.
 * Connects to backend /podcasts/claim and /claims/verify endpoints.
 */

import axiosClient from './axios-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClaimResponse {
  statusCode: number;
  message: string;
  claimId: string;
}

export interface VerifyClaimResponse {
  statusCode: number;
  message: string;
  role: 'CREATOR';
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Request ownership of an external podcast.
 * Triggers a verification email to the podcast owner's email.
 */
export async function claimPodcast(podcastId: string): Promise<ClaimResponse> {
  const { data } = await axiosClient.post<ClaimResponse>('/podcasts/claim', {
    podcastId,
  });
  return data;
}

/**
 * Verify ownership claim using the token from the email link.
 * On success, the user's role is upgraded to CREATOR.
 */
export async function verifyClaim(token: string): Promise<VerifyClaimResponse> {
  const { data } = await axiosClient.get<VerifyClaimResponse>(`/claims/verify/${token}`);
  return data;
}
