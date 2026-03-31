import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface AnalyticsOverview {
  users: number;
  creators: number;
  podcasts: number;
  episodes: number;
  recentUsers: { _id: string; name: string; email: string; role: string }[];
  recentPodcasts: { _id: string; title: string }[];
  recentEpisodes: { _id: string; title: string }[];
}

interface TopEpisode {
  _id: string;
  title: string;
  viewsCount: number;
  likesCount: number;
  podcastId: { _id: string; title: string };
  creatorId: { _id: string; name: string; showName: string };
}

interface TopCreator {
  _id: string;
  showName: string;
  bio: string;
  followerCount: number;
  podcastCount: number;
  userId: string;
}

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/admin/analytics/overview').then((res) => res.data),
  });
}

export function useTopEpisodes(limit: number = 10) {
  return useQuery<TopEpisode[]>({
    queryKey: ['analytics', 'top-episodes', limit],
    queryFn: () => api.get(`/admin/analytics/top-episodes?limit=${limit}`).then((res) => res.data),
  });
}

export function useTopCreators(limit: number = 10) {
  return useQuery<TopCreator[]>({
    queryKey: ['analytics', 'top-creators', limit],
    queryFn: () => api.get(`/admin/analytics/top-creators?limit=${limit}`).then((res) => res.data),
  });
}