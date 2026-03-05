/**
 * Root layout – wraps the app with AuthProvider, PaperProvider, QueryClientProvider.
 */

import {
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/context/auth-context';
import { PaperLightTheme } from '@/constants/theme';
import { queryClient } from '@/services/query-client';

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={PaperLightTheme}>
        <AuthProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Auth screens */}
              <Stack.Screen name="(auth)/onboarding" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(auth)/register" />
              {/* Tab navigator */}
              <Stack.Screen name="(tabs)" />
              {/* Detail screens */}
              <Stack.Screen
                name="podcast/[id]"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="episode/[id]"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="creator/[id]"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              {/* Creator management screens */}
              <Stack.Screen
                name="(creator)/creator-dashboard"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="(creator)/create-podcast"
                options={{ headerShown: false, animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="(creator)/upload-episode"
                options={{ headerShown: false, animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="(creator)/become-creator"
                options={{ headerShown: false, animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="(creator)/edit-creator-profile"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="(creator)/edit-podcast"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="(creator)/edit-episode"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              {/* Profile screens */}
              <Stack.Screen
                name="(profile)/edit-profile"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="(profile)/settings"
                options={{ headerShown: false, animation: 'slide_from_right' }}
              />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </AuthProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
