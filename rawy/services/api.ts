/**
 * Base API client for communicating with the Rawy NestJS backend.
 *
 * Backend base: http://localhost:3000/api/v1
 * Android emulator: http://10.0.2.2:3000/api/v1  (localhost → host machine)
 *
 * Every response is wrapped by the TransformInterceptor as:
 *   { statusCode: number; data: T }
 *
 * Errors from NestJS HttpExceptionFilter arrive as:
 *   { statusCode: number; message: string | string[]; error: string }
 */

import { Platform } from 'react-native';
import { getItem } from './token-storage';

// ─── Base URL ───────────────────────────────────────────────────────────────

export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  ios: 'http://localhost:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
}) as string;

// ─── Token storage keys ─────────────────────────────────────────────────────

export const TOKEN_KEYS = {
  ACCESS: 'rawy_access_token',
  REFRESH: 'rawy_refresh_token',
} as const;

// ─── Shape helpers ───────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  statusCode: number;
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

/** A custom error that carries the backend error payload. */
export class ApiRequestError extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(payload: ApiError) {
    const msgs = Array.isArray(payload.message)
      ? payload.message
      : [payload.message];
    super(msgs.join(', '));
    this.name = 'ApiRequestError';
    this.statusCode = payload.statusCode;
    this.errors = msgs;
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown> | FormData;
  token?: string | null;
  isMultipart?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, isMultipart = false } = options;

  const headers: Record<string, string> = {};

  // Attach auth token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // For JSON bodies set Content-Type; for FormData let the browser/RN set boundary
  if (body && !isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body
      ? isMultipart
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined,
  });

  const text = await response.text();
  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiRequestError({
      statusCode: response.status,
      message: text || 'Unknown error',
      error: 'ParseError',
    });
  }

  if (!response.ok) {
    throw new ApiRequestError(json as ApiError);
  }

  // Unwrap TransformInterceptor envelope
  const envelope = json as ApiSuccess<T>;
  return envelope.data;
}

// ─── Authenticated helper (reads token from SecureStore) ─────────────────────

export async function authenticatedRequest<T>(
  path: string,
  options: Omit<RequestOptions, 'token'> = {},
): Promise<T> {
  const token = await getItem(TOKEN_KEYS.ACCESS);
  return apiRequest<T>(path, { ...options, token });
}
