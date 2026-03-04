/**
 * Auth service — all authentication API calls using Axios.
 */

import axiosClient, { TOKEN_KEYS } from './axios-client';
import { setItem, getItem, deleteItem } from './token-storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'creator' | 'admin' | 'USER' | 'CREATOR' | 'ADMIN';
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

// ─── Token helpers ───────────────────────────────────────────────────────────

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

// ─── Auth API calls ─────────────────────────────────────────────────────────

export async function registerUser(payload: RegisterPayload): Promise<AuthTokens> {
  const { data } = await axiosClient.post<AuthTokens>('/auth/register', payload);
  await persistTokens(data);
  return data;
}

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

  const { data } = await axiosClient.post<AuthTokens>(
    '/auth/register-creator',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  await persistTokens(data);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const { data } = await axiosClient.post<AuthTokens>('/auth/login', payload);
  await persistTokens(data);
  return data;
}

export async function refreshAccessToken(): Promise<AuthTokens> {
  const { refreshToken } = await getStoredTokens();
  if (!refreshToken) throw new Error('No refresh token stored');

  const { data } = await axiosClient.post<AuthTokens>('/auth/refresh', {
    refreshToken,
  });
  await persistTokens(data);
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await axiosClient.post('/auth/logout');
  } catch (error) {
    // Ignore error if logout fails (e.g., token already invalid on server)
    console.debug('Server logout failed, clearing local tokens', error);
  } finally {
    await clearTokens();
  }
}
