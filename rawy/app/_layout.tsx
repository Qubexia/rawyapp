/**
 * Root layout – wraps the app with AuthProvider, PaperProvider, QueryClientProvider.
 * Shows a professional animated splash screen before revealing the app.
 */

import {
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import { PlayerProvider } from '@/context/player-context';
import { PaperLightTheme } from '@/constants/theme';
import { queryClient } from '@/services/query-client';
import SplashScreenAnimated from '@/components/SplashScreenAnimated';

// Prevent native splash from auto-hiding; we control when it goes away
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [animationDone, setAnimationDone] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsReady = fontsLoaded || !!fontError;

  // Hide the native splash screen immediately – our animated splash is on top
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleSplashFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  // Keep splash visible until BOTH fonts are ready AND animation finishes
  const showSplash = !animationDone || !fontsReady;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* App tree – only renders once fonts are ready */}
      {fontsReady && (
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <PaperProvider theme={PaperLightTheme}>
              <AuthProvider>
                <PlayerProvider>
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
                      {/* Full-screen player modal */}
                      <Stack.Screen
                        name="player"
                        options={{
                          headerShown: false,
                          presentation: 'modal',
                          animation: 'slide_from_bottom',
                        }}
                      />
                    </Stack>
                  </ThemeProvider>
                </PlayerProvider>
              </AuthProvider>

            </PaperProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      )}

      {/* Animated splash overlay – single instance, never remounted */}
      {showSplash && <SplashScreenAnimated onFinish={handleSplashFinish} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
