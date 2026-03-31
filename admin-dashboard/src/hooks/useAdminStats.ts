import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  totalPodcasts: number;
  totalEpisodes: number;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<AdminStats>('/admin/stats');
      return response.data;
    },
    staleTime: 30000,
  });
}
