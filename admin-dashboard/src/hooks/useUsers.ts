import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useUsers(page: number = 1, limit: number = 20, role?: string, isActive?: boolean) {
  const queryClient = useQueryClient();
  const queryKey = ['users', page, limit, role, isActive];

  const query = useQuery<PaginatedUsers>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (role) params.append('role', role);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      return response.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => apiClient.patch(`/admin/users/${userId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => apiClient.patch(`/admin/users/${userId}/promote`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string, data: Partial<User> }) => apiClient.patch(`/admin/users/${userId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    ...query,
    activateUser: activateMutation.mutateAsync,
    deactivateUser: deactivateMutation.mutateAsync,
    promoteUser: promoteMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
  };
}

export function useUser(userId: string) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}
