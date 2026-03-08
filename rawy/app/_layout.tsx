/**
 * Root layout – wraps the app with AuthProvider, PaperProvider, QueryClientProvider.
 * Shows a professional animated splash screen before revealing the app.
 */

import {
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/context/auth-context';
import { PlayerProvider, usePlayer } from '@/context/player-context';
import { PaperLightTheme } from '@/constants/theme';
import { queryClient } from '@/services/query-client';
import SplashScreenAnimated from '@/components/SplashScreenAnimated';
import MiniPlayer from '@/components/layout/MiniPlayer';

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
      <StatusBar style="dark" backgroundColor="#FFFFFF" />

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
                      <Stack.Screen
                        name="(profile)/change-password"
                        options={{ headerShown: false, animation: 'slide_from_right' }}
                      />
                      <Stack.Screen
                        name="(profile)/delete-account"
                        options={{ headerShown: false, animation: 'slide_from_right' }}
                      />
                      {/* Legal screens */}
                      <Stack.Screen
                        name="(legal)/terms"
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

                    {/* Global MiniPlayer — visible across all screens when active */}
                    <GlobalMiniPlayer />
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

const TAB_BAR_H = Platform.OS === 'ios' ? 88 : 80;
// Height of the mini-player card (progress bar 3 + content 66 + padding 8)
const MINI_PLAYER_HEIGHT = 77;
// Screens that sit above the tab bar
const TAB_ROUTES = ['/', '/explore', '/library', '/profile'];

function GlobalMiniPlayer() {
  const { currentEpisode } = usePlayer();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Always call hooks unconditionally
  const slideY = useSharedValue(currentEpisode ? 0 : 120);
  useEffect(() => {
    slideY.value = withSpring(
      currentEpisode ? 0 : 120,
      { damping: 18, stiffness: 200, overshootClamping: false },
    );
  }, [currentEpisode, slideY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
    opacity: interpolate(slideY.value, [0, 80], [1, 0]),
  }));

  // Hide on the full-screen player
  if (pathname === '/player') return null;

  const isTabScreen = TAB_ROUTES.includes(pathname);

  // Hide on auth screens (login/register)
  const isAuthScreen = pathname?.includes('/login') || pathname?.includes('/register');
  if (isAuthScreen) return null;

  // On tab screens the tabs layout renders its own MiniPlayer (below the FAB).
  // Rendering here too would place it above the FAB with no way to fix via zIndex.
  if (isTabScreen) return null;
  // On tab screens: sit just above the tab bar
  // On other screens: sit just above the safe-area bottom edge
  const bottomPos = isTabScreen
    ? TAB_BAR_H + 8
    : Math.max(insets.bottom, 16) + 8;

  return (
    <Animated.View
      pointerEvents={currentEpisode ? 'box-none' : 'none'}
      style={[
        {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: bottomPos,
          zIndex: 999,
        },
        animStyle,
      ]}
    >
      <MiniPlayer />
    </Animated.View>
  );
}

export { MINI_PLAYER_HEIGHT };
