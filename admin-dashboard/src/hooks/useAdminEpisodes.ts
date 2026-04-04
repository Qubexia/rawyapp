import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminEpisodeService,
  CreateAdminEpisodePayload,
} from '../services/adminEpisodeService';
import { Episode, UpdateEpisodeDto, EpisodeQueryParams } from '../types/episode';

export interface PaginatedEpisodes {
  data: Episode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook for admin episode CRUD operations.
 * Provides list, create, update (with image), and delete mutations
 * with automatic cache invalidation.
 */
export function useAdminEpisodes(params?: EpisodeQueryParams) {
  const queryClient = useQueryClient();
  const queryKey = ['admin-episodes', params];

  const query = useQuery<PaginatedEpisodes>({
    queryKey,
    queryFn: () => adminEpisodeService.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminEpisodePayload) =>
      adminEpisodeService.createAdminEpisode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-episodes'] });
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      imageFile,
    }: {
      id: string;
      data: UpdateEpisodeDto;
      imageFile?: File | null;
    }) => {
      if (imageFile) {
        return adminEpisodeService.updateWithImage(id, data, imageFile);
      }
      return adminEpisodeService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-episodes'] });
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminEpisodeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-episodes'] });
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
    },
  });

  return {
    ...query,
    createEpisode: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateEpisode: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteEpisode: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
