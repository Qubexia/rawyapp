/**
 * useAuth – convenience re-export so components can do:
 *   import { useAuth } from '@/hooks/use-auth';
 * instead of importing directly from the context file.
 */

export { useAuthContext as useAuth } from '@/context/auth-context';
export type { AuthContextValue } from '@/context/auth-context';
