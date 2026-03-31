import { apiClient } from '@/lib/api';
import {
  Podcast,
  UpdatePodcastDto,
  PodcastListResponse,
  PodcastQueryParams,
} from '@/types/podcast';

export const adminPodcastService = {
  async getAll(params?: PodcastQueryParams): Promise<PodcastListResponse> {
    const response = await apiClient.get<PodcastListResponse>('/admin/podcasts', { params });
    return response.data;
  },

  async getById(id: string): Promise<Podcast> {
    const response = await apiClient.get<Podcast>(`/admin/podcasts/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdatePodcastDto): Promise<Podcast> {
    const response = await apiClient.patch<Podcast>(`/admin/podcasts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/podcasts/${id}`);
  },
};
