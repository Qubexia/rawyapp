/**
 * Auth context — manages the current user session.
 *
 * Uses Axios-based auth service. Wraps app in <AuthProvider>.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";

import {
  UserProfile,
  AuthTokens,
  LoginPayload,
  loginUser,
  logoutUser,
  getStoredTokens,
  clearTokens,
} from "../services/auth.service";
import {
  getMe,
  addDeviceToken,
  removeDeviceToken,
} from "../services/users.service";
import {
  getPushToken,
  getStoredPushToken,
  saveStoredPushToken,
} from "../utils/notifications";
import { ApiError } from "../services/axios-client";
import { queryClient } from "@/services/query-client";

// ─── Context shape ───────────────────────────────────────────────────────────

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
  /** Update the role of the current user. */
  updateUserRole: (role: string) => void;
  /** Update user profile data. */
  updateUser: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session from stored tokens
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { accessToken, refreshToken } = await getStoredTokens();
        console.debug("[AuthContext] Restoration - tokens check:", {
          hasAccess: !!accessToken,
          hasRefresh: !!refreshToken,
        });

        if (accessToken || refreshToken) {
          // if expired, the axios interceptors will handle the refresh.
          const userProfile = await getMe();
          console.debug(
            "[AuthContext] Restoration - success for user:",
            userProfile.name,
          );
          if (active) {
            setUser(userProfile);
          }
        } else {
          console.debug("[AuthContext] Restoration - no tokens found");
        }
      } catch (err) {
        console.error("[AuthContext] Restoration - failed:", err);
        // 401 means the stored tokens are invalid (e.g. DB re-seeded, user deleted,
        // or refresh token expired). Clear them so we don't loop on every startup.
        const is401 =
          (err as any)?.statusCode === 401 ||
          (err as any)?.message === "Unauthorized";
        if (is401) {
          await clearTokens().catch(() => {});
        }
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Safe device token registration side-effect
  useEffect(() => {
    if (user && !isLoading) {
      console.debug(
        "[AuthContext] Authenticated session detected, queuing device token registration...",
      );
      registerDeviceToken().catch((err) =>
        console.error("[AuthContext] Background token reg failed:", err),
      );
    }
  }, [user, isLoading]);

  const registerDeviceToken = useCallback(async () => {
    // Crucial: Only register if we are actually authenticated
    if (!user) {
      console.debug(
        "[AuthContext] Skipping device token registration: not authenticated.",
      );
      return;
    }

    try {
      const token = await getPushToken();
      if (token) {
        await addDeviceToken(token);
        await saveStoredPushToken(token);
        console.debug("[AuthContext] Device token registered successfully");
      }
    } catch (err) {
      console.error("[AuthContext] Failed to register device token:", err);
    }
  }, [user]);

  const unregisterDeviceToken = useCallback(async () => {
    try {
      const token = await getStoredPushToken();
      if (token) {
        await removeDeviceToken(token);
        await saveStoredPushToken(null);
        console.debug("[AuthContext] Device token removed successfully");
      }
    } catch (err) {
      console.error("[AuthContext] Failed to remove device token:", err);
    }
  }, []);

  const setSession = useCallback((tokens: AuthTokens) => {
    setUser(tokens.user);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await loginUser(payload);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await unregisterDeviceToken().catch((err) =>
        console.error("[AuthContext] logout token unreg failed:", err),
      );
      await logoutUser();
    } finally {
      setUser(null);
      // Clear all cached data to prevent data leakage between user sessions
      queryClient.clear();
    }
  }, [unregisterDeviceToken]);

  const updateUserRole = useCallback((role: string) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, role: role as UserProfile["role"] };
    });
  }, []);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    setSession,
    login,
    logout,
    updateUserRole,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}

export { ApiError };
