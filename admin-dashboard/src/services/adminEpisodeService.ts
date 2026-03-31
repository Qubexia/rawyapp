import { apiClient } from '@/lib/api';
import {
  Episode,
  UpdateEpisodeDto,
  EpisodeListResponse,
  EpisodeQueryParams,
} from '@/types/episode';

export const adminEpisodeService = {
  async getAll(params?: EpisodeQueryParams): Promise<EpisodeListResponse> {
    const response = await apiClient.get<EpisodeListResponse>('/admin/episodes', { params });
    return response.data;
  },

  async getById(id: string): Promise<Episode> {
    const response = await apiClient.get<Episode>(`/admin/episodes/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateEpisodeDto): Promise<Episode> {
    const response = await apiClient.patch<Episode>(`/admin/episodes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/episodes/${id}`);
  },
};
