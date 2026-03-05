import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { loginWithGoogleMobile } from '@/services/auth.service';
import { useAuthContext } from '@/context/auth-context';
import { STORAGE_KEYS } from '@/utils/constants';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const router = useRouter();
  const { setSession } = useAuthContext();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: '871601943927-ogtg73rhul0bs7mi7mkle0cp1m2t4o3b.apps.googleusercontent.com',
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
