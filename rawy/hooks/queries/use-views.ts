/**
 * React Query hooks for Views.
 * Use useRecordView mutation to record episode views (fire-and-forget).
 */

import { useMutation } from '@tanstack/react-query';
import { recordView } from '../../services/views.service';

export const viewKeys = {
  all: ['views'] as const,
};

export function useRecordView() {
  return useMutation({
    mutationFn: (episodeId: string) => recordView(episodeId),
    // Fire-and-forget: no retries, no error handling in UI
    retry: false,
  });
}
