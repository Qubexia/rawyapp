'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface BroadcastRequest {
  title?: string;
  body?: string;
  targetRole?: string;
}

interface NotificationHistoryItem {
  _id: string;
  title: string;
  body: string;
  targetRole: string;
  sentAt: string;
}

export function useNotifications(page: number = 1, limit: number = 20) {
  return useQuery<{ data: NotificationHistoryItem[]; total: number; page: number; limit: number; totalPages: number }>({
    queryKey: ['notifications', 'history', page, limit],
    queryFn: () => api.get(`/admin/notifications?page=${page}&limit=${limit}`).then((res) => res.data),
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BroadcastRequest) => api.post('/admin/notifications/broadcast', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useBroadcastByRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BroadcastRequest) => api.post('/admin/notifications/broadcast-by-role', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}