/**
 * Tab layout — 4 tabs with Lucide icons + Creator center FAB (Animated - FIXED).
 */

import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import {
  Home,
  Search,
  Library,
  User,
  Plus,
  Mic,
  Upload,
} from 'lucide-react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/layout/haptic-tab';
import { Palette } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { isCreator } from '@/utils/roles';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 80;
const FAB_SIZE = 56;

export default function TabLayout() {
  const isDark = false;
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [fabOpen, setFabOpen] = useState(false);
  const creatorUser = isCreator(user);

  const progress = useSharedValue(0);

  const toggleFab = () => {
    const next = !fabOpen;
    setFabOpen(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 250 });
  };

  const closeFab = () => {
    setFabOpen(false);
    progress.value = withTiming(0, { duration: 200 });
  };

  const handleNewPodcast = () => {
    closeFab();
    router.push('/(creator)/create-podcast' as any);
  };

  const handleUploadEpisode = () => {
    closeFab();
    router.push('/(creator)/upload-episode' as any);
  };

  // FAB animation
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg`,
      },
      {
        scale: interpolate(progress.value, [0, 1], [1, 1.1]),
      },
    ],
  }));

  // Backdrop fade
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  // Actions animation
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [40, 0]),
      },
    ],
  }));

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: isDark
            ? Palette.text.darkTertiary
            : Palette.text.lightTertiary,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.5,
            height: TAB_BAR_HEIGHT,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Home size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => (
              <Search size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => (
              <Library size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <User size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      {creatorUser && (
        <>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeFab}>
            <Animated.View
              pointerEvents={fabOpen ? 'auto' : 'none'}
              style={[styles.backdrop, backdropStyle]}
            />
          </TouchableWithoutFeedback>

          {/* Actions */}
          <Animated.View
            pointerEvents={fabOpen ? 'auto' : 'none'}
            style={[
              styles.actionsRow,
              { bottom: TAB_BAR_HEIGHT + 40 },
              actionsStyle,
            ]}
          >
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleNewPodcast}
            >
              <View
                style={[
                  styles.actionButton,
                  { backgroundColor: Palette.primary[500] },
                ]}
              >
                <Mic size={22} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>New Podcast</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleUploadEpisode}
            >
              <View
                style={[
                  styles.actionButton,
                  { backgroundColor: Palette.secondary[500] },
                ]}
              >
                <Upload size={22} color="#FFF" />
              </View>
              <Text style={styles.actionLabel}>Upload Episode</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* FAB */}
          <View
            style={[
              styles.fabContainer,
              { bottom: TAB_BAR_HEIGHT - FAB_SIZE / 2 },
            ]}
          >
            <TouchableOpacity activeOpacity={0.85} onPress={toggleFab}>
              <Animated.View
                style={[
                  styles.fab,
                  fabAnimatedStyle,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Plus size={26} color="#FFF" strokeWidth={2.5} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },
  actionsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    zIndex: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  actionLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
  },
});