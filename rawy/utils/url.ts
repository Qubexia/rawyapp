import { SERVER_URL } from '@/services/axios-client';

/**
 * Resolves a potentially relative image path from the server into a full URL.
 * If the path is already a full URL (starts with http), it returns it as is.
 */
export function resolveImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  
  // Normalize Windows backslashes from server paths stored in DB
  const normalizedPath = path.replace(/\\/g, '/').replace(/^\//, '');
  return `${SERVER_URL}/${normalizedPath}`;
}
