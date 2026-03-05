/**
 * React Query hooks for Users.
 */

import { useMutation } from '@tanstack/react-query';
import { updateMe } from '../../services/users.service';
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
