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

  /**
   * Update podcast metadata with optional cover image file upload.
   * Sends multipart/form-data when an imageFile is provided.
   */
  async updateWithImage(
    id: string,
    data: UpdatePodcastDto,
    imageFile?: File | null,
  ): Promise<Podcast> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.status) formData.append('status', data.status);
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    const response = await apiClient.patch<Podcast>(`/admin/podcasts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/podcasts/${id}`);
  },
};

