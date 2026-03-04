/**
 * TanStack React Query client configuration.
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './axios-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      // Never let React Query retry on 401 — the axios interceptor already
      // handles token refresh and retries the original request once. React
      // Query retrying would spawn a new request (no _retry flag) and kick
      // off another refresh cycle, creating the endless 401 loop.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.statusCode === 401) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
