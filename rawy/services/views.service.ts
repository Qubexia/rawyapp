import axiosClient from './axios-client';

export interface ViewResult {
  message: string;
  viewsCount: number;
  isNewView: boolean;
}

export async function recordView(episodeId: string): Promise<ViewResult> {
  const { data } = await axiosClient.post<{ data: ViewResult }>(`/views/episodes/${episodeId}`);
  return data.data;
}
