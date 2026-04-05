/**
 * React Query hooks for podcast ownership claiming.
 */

import { useMutation } from '@tanstack/react-query';
import { claimPodcast, verifyClaim } from '../../services/claims.service';

/**
 * Request ownership claim for an external podcast.
 */
export function useClaimPodcast() {
  return useMutation({
    mutationFn: (podcastId: string) => claimPodcast(podcastId),
  });
}

/**
 * Verify a claim using the token from the email link.
 */
export function useVerifyClaim() {
  return useMutation({
    mutationFn: (token: string) => verifyClaim(token),
  });
}
