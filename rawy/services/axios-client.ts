/**
 * Axios client with auth interceptors.
 *
 * - Auto-attaches access token to every request.
 * - On 401 → tries to refresh tokens once, retries original request.
 * - If refresh fails → clears tokens (caller should redirect to login).
 */

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { Platform } from 'react-native';
import { getItem, setItem, deleteItem } from './token-storage';

// ─── Constants ───────────────────────────────────────────────────────────────

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  ios: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
}) as string;

export const TOKEN_KEYS = {
  ACCESS: 'rawy_access_token',
  REFRESH: 'rawy_refresh_token',
} as const;

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

// ─── Create Axios instance ──────────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach auth token ─────────────────────────────────

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip for public/auth endpoints that don't need a token
    const publicPaths = ['/auth/login', '/auth/register', '/auth/register-creator', '/auth/refresh'];
    const isPublic = publicPaths.some((p) => config.url?.startsWith(p));

    if (!isPublic) {
      const token = await getItem(TOKEN_KEYS.ACCESS);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: handle 401 + normalize errors ────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (reason: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      axiosClient(config).then(resolve).catch(reject);
    }
  });
  failedQueue = [];
}

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap the { statusCode, data } envelope from the backend
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retrying and not a refresh request itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getItem(TOKEN_KEYS.REFRESH);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data?.accessToken ?? data.accessToken;
        const newRefreshToken = data.data?.refreshToken ?? data.refreshToken;

        await setItem(TOKEN_KEYS.ACCESS, newAccessToken);
        await setItem(TOKEN_KEYS.REFRESH, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Clear tokens — session is dead
        await deleteItem(TOKEN_KEYS.ACCESS);
        await deleteItem(TOKEN_KEYS.REFRESH);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize all other errors
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
