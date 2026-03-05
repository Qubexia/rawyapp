/**
 * Axios client with auth interceptors.
 *
 * Strategy:
 *  1. PROACTIVE: Before every protected request, decode the JWT and check its
 *     expiry. If it expires within 60 s (or is already expired), refresh first.
 *     This eliminates 401s from normal token expiry during a session.
 *  2. REACTIVE (fallback): If a 401 ever slips through (e.g. clock skew,
 *     server-side revocation), refresh once and retry.
 *  3. DEDUPLICATION: All concurrent requests that trigger a refresh share one
 *     single refresh call via a shared promise.
 */

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { Platform } from 'react-native';
import { getItem, setItem, deleteItem } from './token-storage';

// ─── Constants ───────────────────────────────────────────────────────────────

// Use your local machine's IP address instead of localhost/10.0.2.2 for physical device testing
// Run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) to find yours.
const LOCAL_IP = '192.168.1.3'; // Your current local IP

export const SERVER_URL = Platform.select({
  android: `http://${LOCAL_IP}:3000`, // Was 'http://10.0.2.2:3000' for emulator
  ios: `http://${LOCAL_IP}:3000`,     // Was 'http://localhost:3000' for simulator
  default: `http://${LOCAL_IP}:3000`,
}) as string;

export const API_BASE_URL = `${SERVER_URL}/api/v1`;


export const TOKEN_KEYS = {
  ACCESS: 'rawy_access_token',
  REFRESH: 'rawy_refresh_token',
} as const;

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/register-creator',
  '/auth/refresh',
  '/podcasts',
  '/episodes',
  '/comments',
  '/creators',
];

// ─── Error types ─────────────────────────────────────────────────────────────

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(payload: ApiErrorPayload) {
    const msgs = Array.isArray(payload.message)
      ? payload.message
      : [payload.message];
    super(msgs.join(', '));
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.errors = msgs;
  }
}

// ─── JWT helpers ─────────────────────────────────────────────────────────────

/** Extracts `exp` (Unix seconds) from a JWT without any external library. */
function jwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // Safe atob check for React Native
    const safeAtob = typeof globalThis.atob === 'function' ? globalThis.atob : null;
    if (!safeAtob) {
       console.debug('[Axios] globalThis.atob is missing, proactive refresh disabled.');
       return null; 
    }
    
    const json = safeAtob(b64);
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' ? exp : null;
  } catch (err) {
    console.debug('[Axios] Error decoding JWT:', err);
    return null;
  }
}

/**
 * Returns true when the token is already expired or will expire within
 * `bufferMs` milliseconds. Defaults to a 60-second buffer so we refresh
 * proactively before the server rejects the token.
 */
function isExpiringSoon(token: string, bufferMs = 60_000): boolean {
  const exp = jwtExp(token);
  if (exp === null) return false; // can't decode → rely on reactive 401 fallback
  return exp * 1000 - Date.now() < bufferMs;
}

// ─── Shared refresh promise ───────────────────────────────────────────────────
//
// All concurrent callers (both proactive from request interceptor and reactive
// from 401 response interceptor) share a single in-flight refresh call.
// This prevents N parallel requests from each triggering their own refresh.

let refreshPromise: Promise<string> | null = null;

async function executeRefresh(): Promise<string> {
  // Return the in-flight promise if a refresh is already running.
  if (refreshPromise) {
    console.debug('[Axios] Using existing refresh promise');
    return refreshPromise;
  }

  console.debug('[Axios] Executing token refresh...');
  refreshPromise = (async () => {
    const storedRefreshToken = await getItem(TOKEN_KEYS.REFRESH);
    if (!storedRefreshToken) {
      console.warn('[Axios] Cannot refresh at this time: no refresh token stored locally.');
      throw new Error('No refresh token stored');
    }

    // Use raw axios (not axiosClient) to avoid going through our interceptors.
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: storedRefreshToken,
    });

    const tokens = data.data ?? data;
    const newAccessToken: string | undefined = tokens.accessToken;
    const newRefreshToken: string | undefined = tokens.refreshToken;

    if (!newAccessToken) throw new Error('No access token returned by refresh');

    console.debug('[Axios] Refresh successful');
    await setItem(TOKEN_KEYS.ACCESS, newAccessToken);
    if (newRefreshToken) await setItem(TOKEN_KEYS.REFRESH, newRefreshToken);

    return newAccessToken;
  })()
    .catch(async (err) => {
      console.error('[Axios] Refresh failed:', err);
      // Refresh failed – wipe credentials so the app can redirect to login.
      await deleteItem(TOKEN_KEYS.ACCESS);
      await deleteItem(TOKEN_KEYS.REFRESH);
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─── Create Axios instance ──────────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

/** Timeout used for multipart/file-upload requests (5 minutes). */
export const UPLOAD_TIMEOUT = 5 * 60 * 1000;

// ─── Request interceptor: attach (and proactively refresh) auth token ────────

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const isAuthPath = ['/auth/login', '/auth/register', '/auth/register-creator', '/auth/refresh'].some(p => url.startsWith(p));
    
    // Only GET requests to browsing paths are truly "public" (no token needed).
    // Mutation requests (POST, PATCH, DELETE) to these paths ALWAYS need a token.
    const isPublicGet = config.method?.toLowerCase() === 'get' && 
      ['/podcasts', '/episodes', '/comments', '/creators'].some(p => url.startsWith(p));

    if (isAuthPath || isPublicGet) {
      return config;
    }

    let token = await getItem(TOKEN_KEYS.ACCESS);
    
    if (!token) {
      // If we are here, it's a protected route (or a mutation to a public-browsing route)
      console.debug(`[Axios] Request to "${config.url}" (${config.method}) missing access token.`);
      return config;
    }

    // Proactively refresh when the token is about to expire (within 60 s).
    // This is the main mechanism that prevents 401s during normal usage.
    if (isExpiringSoon(token)) {
      try {
        console.debug('[Axios] Proactive refresh triggered for:', config.url);
        token = await executeRefresh();
      } catch {
        // Refresh failed (e.g. refresh token is also expired). Send the request
        // without a token; the 401 handler below will deal with it and clear
        // credentials so the user is redirected to login.
        console.debug('[Axios] Proactive refresh failed, sending request without token.');
        return config;
      }
    }

    // Always write Authorization via .set() — works correctly with Axios 1.x
    // AxiosHeaders, and also correctly overwrites any stale header that may
    // have survived a mergeConfig on a retry request.
    config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: normalize errors + reactive 401 fallback ──────────

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap the { statusCode, data } envelope from the backend.
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Reactive 401 fallback: handles edge cases like clock skew or server-side
    // token revocation that the proactive check cannot anticipate.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        // Only attempt refresh if we actually have a refresh token.
        const hasRefreshToken = !!(await getItem(TOKEN_KEYS.REFRESH));
        if (hasRefreshToken) {
          await executeRefresh();
          return axiosClient(originalRequest);
        } else {
          console.debug('[Axios] 401 encountered but no refresh token available. Skipping retry.');
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Normalize errors.
    if (error.response?.data) {
      return Promise.reject(new ApiError(error.response.data));
    }

    if (error.message === 'Network Error') {
      return Promise.reject(
        new ApiError({
          statusCode: 0,
          message: 'Unable to connect to server. Check your connection.',
          error: 'NetworkError',
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
