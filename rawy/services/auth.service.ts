/**
 * Auth service – all calls to /auth/* endpoints.
 *
 * Endpoints used:
 *   POST /auth/register            → { name, email, password }
 *   POST /auth/register-creator    → multipart/form-data
 *   POST /auth/login               → { email, password }
 *   POST /auth/refresh             → { refreshToken }
 *   POST /auth/logout              → Bearer token required
 */

import { apiRequest, authenticatedRequest, TOKEN_KEYS } from './api';
import { setItem, getItem, deleteItem } from './token-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'creator' | 'admin';
  isActive: boolean;
  googleId?: string;
  facebookId?: string;
  deviceTokens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterCreatorPayload {
  name: string;
  email: string;
  password: string;
  showName: string;
  avatar?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Persist tokens ──────────────────────────────────────────────────────────

export async function persistTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    setItem(TOKEN_KEYS.ACCESS, tokens.accessToken),
    setItem(TOKEN_KEYS.REFRESH, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    deleteItem(TOKEN_KEYS.ACCESS),
    deleteItem(TOKEN_KEYS.REFRESH),
  ]);
}

export async function getStoredTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    getItem(TOKEN_KEYS.ACCESS),
    getItem(TOKEN_KEYS.REFRESH),
  ]);
  return { accessToken, refreshToken };
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

/**
 * Register a regular listener account.
 * Endpoint: POST /auth/register
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthTokens> {
  const result = await apiRequest<AuthTokens>('/auth/register', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
  await persistTokens(result);
  return result;
}

/**
 * Register a creator account (supports optional avatar upload).
 * Endpoint: POST /auth/register-creator (multipart/form-data)
 */
export async function registerCreator(payload: RegisterCreatorPayload): Promise<AuthTokens> {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('email', payload.email);
  formData.append('password', payload.password);
  formData.append('showName', payload.showName);

  if (payload.avatar) {
    formData.append('avatar', {
      uri: payload.avatar.uri,
      name: payload.avatar.name,
      type: payload.avatar.type,
    } as unknown as Blob);
  }

  const result = await apiRequest<AuthTokens>('/auth/register-creator', {
    method: 'POST',
    body: formData as unknown as Record<string, unknown>,
    isMultipart: true,
  });
  await persistTokens(result);
  return result;
}

/**
 * Login with email + password.
 * Endpoint: POST /auth/login
 */
export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const result = await apiRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
  });
  await persistTokens(result);
  return result;
}

/**
 * Refresh access token using the stored refresh token.
 * Endpoint: POST /auth/refresh
 */
export async function refreshAccessToken(): Promise<AuthTokens> {
  const { refreshToken } = await getStoredTokens();
  if (!refreshToken) throw new Error('No refresh token stored');

  const result = await apiRequest<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken } as unknown as Record<string, unknown>,
  });
  await persistTokens(result);
  return result;
}

/**
 * Logout the current user (invalidates refresh token on the server).
 * Endpoint: POST /auth/logout
 */
export async function logoutUser(): Promise<void> {
  try {
    await authenticatedRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  } finally {
    await clearTokens();
  }
}
