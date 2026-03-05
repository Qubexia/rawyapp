/**
 * React Query hooks for Users.
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { updateMe, updateAvatar, getPublicProfile } from '../../services/users.service';
import { useAuthContext } from '../../context/auth-context';

export function useUpdateMe() {
  const { updateUser } = useAuthContext();
  
  return useMutation({
    mutationFn: (data: Partial<{ name: string }>) => updateMe(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
    },
  });
}

export function useUpdateAvatar() {
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: (image: { uri: string; name: string; type: string }) => updateAvatar(image),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
    },
  });
}

export function usePublicProfile(id: string) {
  return useQuery({
    queryKey: ['users', id, 'public'],
    queryFn: () => getPublicProfile(id),
    enabled: !!id,
  });
}

