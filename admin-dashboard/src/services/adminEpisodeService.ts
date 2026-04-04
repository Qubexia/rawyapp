import { apiClient } from '@/lib/api';
import {
  Episode,
  UpdateEpisodeDto,
  EpisodeListResponse,
  EpisodeQueryParams,
} from '@/types/episode';

export interface CreateAdminEpisodePayload {
  title: string;
  description: string;
  podcastId: string;
  duration?: number;
  audioFile: File;
  imageFile?: File | null;
  onUploadProgress?: (progressEvent: any) => void;
}

export const adminEpisodeService = {
  async getAll(params?: EpisodeQueryParams): Promise<EpisodeListResponse> {
    const response = await apiClient.get<EpisodeListResponse>('/admin/episodes', { params });
    return response.data;
  },

  async getById(id: string): Promise<Episode> {
    const response = await apiClient.get<Episode>(`/admin/episodes/${id}`);
    return response.data;
  },

  /**
   * Create an episode for any podcast via the admin endpoint.
   * Builds multipart/form-data with audio file and optional image.
   * The backend resolves the podcast's original creator for attribution.
   */
  async createAdminEpisode(payload: CreateAdminEpisodePayload): Promise<Episode> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('podcastId', payload.podcastId);
    if (payload.duration !== undefined) {
      formData.append('duration', String(payload.duration));
    }
    formData.append('audioFile', payload.audioFile);
    if (payload.imageFile) {
      formData.append('imageFile', payload.imageFile);
    }

    const response = await apiClient.post<Episode>('/admin/episodes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: payload.onUploadProgress,
    });
    return response.data;
  },

  async update(id: string, data: UpdateEpisodeDto): Promise<Episode> {
    const response = await apiClient.patch<Episode>(`/admin/episodes/${id}`, data);
    return response.data;
  },

  /**
   * Update episode metadata with optional cover image file upload.
   * Does NOT allow audio file replacement.
   */
  async updateWithImage(
    id: string,
    data: UpdateEpisodeDto,
    imageFile?: File | null,
  ): Promise<Episode> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    const response = await apiClient.patch<Episode>(`/admin/episodes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/episodes/${id}`);
  },
};
