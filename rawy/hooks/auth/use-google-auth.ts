import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

import { loginWithGoogleMobile } from '@/services/auth.service';
import { useAuthContext } from '@/context/auth-context';
import { STORAGE_KEYS } from '@/utils/constants';

// Lazy import to avoid crash when ExpoApplication native module is missing (Expo Go)
let Google: any = null;
try {
  Google = require('expo-auth-session/providers/google');
} catch (e) {
  console.log('[useGoogleAuth] Note: Google auth will require a development build.');
}

WebBrowser.maybeCompleteAuthSession();

/**
 * Fallback hook when Google auth module is not available (Expo Go).
 */
function useGoogleAuthFallback() {
  const [googleError, setGoogleError] = useState<string | null>(null);
  return {
    signInWithGoogle: () => {
      setGoogleError('Google Sign-In is not available in this environment. Use a development build.');
    },
    googleLoading: false,
    googleError,
    isReady: false,
  };
}

/**
 * Real hook when Google auth module is available (development build).
 */
function useGoogleAuthReal() {
  const router = useRouter();
  const { setSession } = useAuthContext();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: '871601943927-ogtg73rhul0bs7mi7mkle0cp1m2t4o3b.apps.googleusercontent.com',
    iosClientId: '871601943927-ogtg73rhul0bs7mi7mkle0cp1m2t4o3b.apps.googleusercontent.com',
    androidClientId: '871601943927-4gd3qbd1cuarmrs5082486e6tudvnfjv.apps.googleusercontent.com',
  });

  const handleGoogleLogin = useCallback(async () => {
    if (!response || response.type !== 'success') return;
    
    setGoogleLoading(true);
    setGoogleError(null);
    
    try {
      const { id_token } = response.params;
      
      if (!id_token) {
        throw new Error('No ID token received from Google');
      }

      const tokens = await loginWithGoogleMobile(id_token);
      setSession(tokens);
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true').catch(() => {});
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Google login failed:', error);
      setGoogleError(error.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  }, [response, router, setSession]);

  useEffect(() => {
    handleGoogleLogin();
  }, [handleGoogleLogin]);

  const signInWithGoogle = () => {
    setGoogleError(null);
    promptAsync();
  };

  return {
    signInWithGoogle,
    googleLoading,
    googleError,
    isReady: !!request,
  };
}

/**
 * Exported hook – picks the right implementation based on module availability.
 */
export function useGoogleAuth() {
  // This is safe because `Google` is a module-level constant that never changes at runtime,
  // so the same branch always executes (consistent hook call count).
  if (!Google) {
    return useGoogleAuthFallback();
  }
  return useGoogleAuthReal();
}
