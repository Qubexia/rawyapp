/**
 * Utility for generating and parsing deep links.
 * Used for episode sharing and app navigation.
 */

export const DOMAIN = 'https://rawy.app'; // Placeholder domain
export const SCHEME = 'rawy';

/**
 * Generates a shareable URL for a specific episode.
 * Currently uses the web-ready domain which should be configured 
 * for Universal Links (iOS) and App Links (Android).
 */
export function generateEpisodeLink(episodeId: string): string {
    return `${DOMAIN}/episode/${episodeId}`;
}

/**
 * Generates a native deep link for the same content.
 * Useful for internal routing or testing.
 */
export function generateNativeEpisodeLink(episodeId: string): string {
    return `${SCHEME}://episode/${episodeId}`;
}

/**
 * Extracts route and params from a deep link URL.
 * Supports both custom scheme and universal/app link formats.
 */
export function parseDeepLink(url: string): { route: string; params?: Record<string, string> } | null {
    try {
        const parsed = new URL(url);

        // Universal/App Link: https://rawy.app/episode/123
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            const parts = parsed.pathname.split('/').filter(Boolean);
            if (parts[0] === 'episode' && parts[1]) {
                return { route: '/episode/[id]', params: { id: parts[1] } };
            }
        }

        // Custom Scheme: rawy://episode/123
        if (parsed.protocol === `${SCHEME}:`) {
            const host = parsed.host; // episode
            const path = parsed.pathname.replace(/^\//, ''); // 123
            if (host === 'episode' && path) {
                return { route: '/episode/[id]', params: { id: path } };
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}
