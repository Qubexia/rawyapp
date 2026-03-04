/**
 * Auth context – manages the current user session across the whole app.
 *
 * Wraps the app in <AuthProvider> (done inside app/_layout.tsx).
 * Consumers call:
 *   const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren,
} from 'react';

import {
  UserProfile,
  AuthTokens,
  LoginPayload,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getStoredTokens,
} from '../services/auth.service';
import { ApiRequestError } from '../services/api';

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** The currently authenticated user, or null if not signed in. */
  user: UserProfile | null;
  /** True while checking persisted tokens on app start. */
  isLoading: boolean;
  /** True if the user has a valid session. */
  isAuthenticated: boolean;
  /** Set user + tokens after a successful register/login from outside this context. */
  setSession: (tokens: AuthTokens) => void;
  /** Login with email + password. */
  login: (payload: LoginPayload) => Promise<void>;
  /** Logout and clear tokens. */
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from stored tokens
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { refreshToken } = await getStoredTokens();
        if (refreshToken) {
          const freshTokens = await refreshAccessToken();
          if (active) setUser(freshTokens.user);
        }
      } catch {
        // Refresh failed → user must log in again
        setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const setSession = useCallback((tokens: AuthTokens) => {
    setUser(tokens.user);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await loginUser(payload);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    setSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the auth context from any component inside <AuthProvider>.
 *
 * @example
 * const { user, logout } = useAuthContext();
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}

export { ApiRequestError };
