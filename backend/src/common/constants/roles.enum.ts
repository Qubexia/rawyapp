export enum Role {
  USER = 'USER',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN',
}

export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.USER]: [Role.USER],
  [Role.CREATOR]: [Role.USER, Role.CREATOR],
  [Role.ADMIN]: [Role.USER, Role.CREATOR, Role.ADMIN],
};

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole].includes(requiredRole);
}
