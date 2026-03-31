import { apiClient } from '@/lib/api';
import {
  Podcast,
  CreatePodcastDto,
  UpdatePodcastDto,
  PodcastListResponse,
  PodcastQueryParams,
} from '@/types/podcast';

export const podcastService = {
  async create(data: CreatePodcastDto): Promise<Podcast> {
    const response = await apiClient.post<Podcast>('/podcasts', data);
    return response.data;
  },

  async getAll(params?: PodcastQueryParams): Promise<PodcastListResponse> {
    const response = await apiClient.get<PodcastListResponse>('/podcasts', { params });
    return response.data;
  },

  async getById(id: string): Promise<Podcast> {
    const response = await apiClient.get<Podcast>(`/podcasts/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdatePodcastDto): Promise<Podcast> {
    const response = await apiClient.patch<Podcast>(`/podcasts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/podcasts/${id}`);
  },

  async publish(id: string): Promise<Podcast> {
    const response = await apiClient.post<Podcast>(`/podcasts/${id}/publish`);
    return response.data;
  },

  async getByCreator(creatorId: string, params?: PodcastQueryParams): Promise<PodcastListResponse> {
    const response = await apiClient.get<PodcastListResponse>(`/podcasts/creator/${creatorId}`, { params });
    return response.data;
  },
};
