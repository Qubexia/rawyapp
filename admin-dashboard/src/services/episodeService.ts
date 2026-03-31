import { apiClient } from '@/lib/api';
import {
  Episode,
  CreateEpisodeDto,
  UpdateEpisodeDto,
  EpisodeListResponse,
  EpisodeQueryParams,
} from '@/types/episode';

export const episodeService = {
  async create(data: CreateEpisodeDto): Promise<Episode> {
    const response = await apiClient.post<Episode>('/episodes', data);
    return response.data;
  },

  async getAll(params?: EpisodeQueryParams): Promise<EpisodeListResponse> {
    const response = await apiClient.get<EpisodeListResponse>('/episodes', { params });
    return response.data;
  },

  async getById(id: string): Promise<Episode> {
    const response = await apiClient.get<Episode>(`/episodes/${id}`);
    return response.data;
  },

  async getByPodcast(podcastId: string, params?: EpisodeQueryParams): Promise<EpisodeListResponse> {
    const response = await apiClient.get<EpisodeListResponse>(`/episodes/podcast/${podcastId}`, { params });
    return response.data;
  },

  async update(id: string, data: UpdateEpisodeDto): Promise<Episode> {
    const response = await apiClient.patch<Episode>(`/episodes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/episodes/${id}`);
  },
};
