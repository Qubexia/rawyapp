export interface Episode {
  id: string;
  title: string;
  description: string;
  audioFileUrl: string;
  duration?: number;
  podcastId: string;
  creatorId: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEpisodeDto {
  title: string;
  description: string;
  audioFileUrl: string;
  duration?: number;
  podcastId: string;
  imageUrl?: string;
}

export interface UpdateEpisodeDto {
  title?: string;
  description?: string;
  audioFileUrl?: string;
  duration?: number;
  imageUrl?: string;
}

export interface EpisodeListResponse {
  data: Episode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EpisodeQueryParams {
  page?: number;
  limit?: number;
  podcastId?: string;
  search?: string;
}
