import { SERVER_URL } from '@/services/axios-client';

/**
 * Resolves a potentially relative image path from the server into a full URL.
 * If the path is already a full URL (starts with http), it returns it as is.
 */
export function resolveImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  
  // Normalize Windows backslashes and clean up path artifacts
  let normalizedPath = path
    .replace(/\\/g, '/')       // Convert backslashes to forward slashes
    .replace(/^\.\//, '')      // Remove leading ./
    .replace(/^\/+/, '')       // Remove leading slashes
    .replace(/\/\/+/g, '/');   // Collapse double slashes
  
  return `${SERVER_URL}/${normalizedPath}`;
}
