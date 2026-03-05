/**
 * Role helper utilities — normalize role comparisons.
 */

import type { UserProfile } from '@/services/auth.service';

type UserLike = Pick<UserProfile, 'role'> | null | undefined;

export function isCreator(user: UserLike): boolean {
  return user?.role === 'creator' || user?.role === 'CREATOR';
}

export function isAdmin(user: UserLike): boolean {
  return user?.role === 'admin' || user?.role === 'ADMIN';
}

export function isListener(user: UserLike): boolean {
  return !isCreator(user) && !isAdmin(user);
}
