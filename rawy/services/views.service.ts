/**
 * Views service — record episode views (fire-and-forget).
 * Used by PlayerContext when user plays an episode.
 */

import axiosClient from './axios-client';

/**
 * Record a view for an episode. Fire-and-forget — does not throw or show errors to the user.
 * Call this when the user starts playing an episode. The backend handles idempotency.
 */
export async function recordView(episodeId: string): Promise<void> {
  try {
    await axiosClient.post(`/views/episodes/${episodeId}`);
  } catch {
    // Fire-and-forget: silently ignore errors (network, 401, etc.)
    // User experience should not be affected by view recording failures
  }
}
