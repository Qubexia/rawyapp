export type PodcastCategory =
  | 'Technology'
  | 'Business'
  | 'Comedy'
  | 'Education'
  | 'Health'
  | 'Science'
  | 'Culture'
  | 'Sports';

export type PodcastStatus = 'draft' | 'published';

export interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  creatorId: string;
  episodeCount: number;
  category?: PodcastCategory;
  status: PodcastStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePodcastDto {
  title: string;
  description: string;
  category?: PodcastCategory;
  coverImageUrl?: string;
}

export interface UpdatePodcastDto {
  title?: string;
  description?: string;
  category?: PodcastCategory;
  coverImageUrl?: string;
  status?: PodcastStatus;
}

export interface PodcastListResponse {
  data: Podcast[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PodcastQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: PodcastStatus;
}
