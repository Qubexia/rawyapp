/**
 * Tab layout — 4 tabs with Lucide icons + Creator center FAB (Animated - FIXED).
 */

import { Tabs, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import {
  Home,
  Search,
  Library,
  User,
  Plus,
  Mic,
  Upload,
} from "lucide-react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated";

import { HapticTab } from "@/components/layout/haptic-tab";
import { Palette } from "@/constants/theme";
import { useAuthContext } from "@/context/auth-context";
import { isCreator } from "@/utils/roles";
import { usePlayer } from "@/context/player-context";
import MiniPlayer from "@/components/layout/MiniPlayer";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 80;
// Actual rendered height of the MiniPlayer card (3px progress + 66px content + 8px paddingBottom)
const MINI_PLAYER_HEIGHT = 77;
const FAB_SIZE = 56;

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const { currentEpisode } = usePlayer();

  const [fabOpen, setFabOpen] = useState(false);
  const creatorUser = isCreator(user);

  const progress = useSharedValue(0);

  // MiniPlayer slide-up animation
  const miniY = useSharedValue(100);
  useEffect(() => {
    miniY.value = withSpring(
      currentEpisode ? 0 : 100,
      { damping: 18, stiffness: 200, overshootClamping: false },
    );
  }, [currentEpisode, miniY]);
  const miniPlayerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: miniY.value }],
    opacity: interpolate(miniY.value, [0, 60], [1, 0]),
  }));

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
    router.push("/(creator)/create-podcast" as any);
  };

  const handleUploadEpisode = () => {
    closeFab();
    router.push("/(creator)/upload-episode" as any);
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

  const bottomOffset = currentEpisode
    ? TAB_BAR_HEIGHT + 8 + MINI_PLAYER_HEIGHT + FAB_SIZE / 2 + 8
    : TAB_BAR_HEIGHT;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: Palette.text.lightTertiary,
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
              borderTopWidth: 0.5,
              height: TAB_BAR_HEIGHT,
              paddingBottom: Platform.OS === "ios" ? 28 : 8,
              paddingTop: 8,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: "Explore",
              tabBarIcon: ({ color }) => <Search size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: "Library",
              tabBarIcon: ({ color }) => <Library size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => <User size={24} color={color} />,
            }}
          />
        </Tabs>
      </View>

      {/* Floating MiniPlayer — zIndex 25, always BELOW the FAB (zIndex 999999) */}
      <Animated.View
        pointerEvents={currentEpisode ? 'box-none' : 'none'}
        style={[styles.miniPlayerWrapper, miniPlayerStyle]}
      >
        <MiniPlayer />
      </Animated.View>

      {creatorUser && (
        <>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeFab}>
            <Animated.View
              pointerEvents={fabOpen ? "auto" : "none"}
              style={[styles.backdrop, backdropStyle]}
            />
          </TouchableWithoutFeedback>

          {/* Actions */}
          <Animated.View
            pointerEvents={fabOpen ? "auto" : "none"}
            style={[
              styles.actionsRow,
              { bottom: bottomOffset + 40 },
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

          {/* FAB — moves to far right when mini player is active */}
          <View
            style={[
              styles.fabContainer,
              { bottom: bottomOffset - FAB_SIZE / 2 },
              currentEpisode ? styles.fabRight : styles.fabCenter,
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
    position: "absolute",
    zIndex: 999999,
  },
  fabCenter: {
    alignSelf: "center",
  },
  fabRight: {
    right: 20,
  },
  miniPlayerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT,
    zIndex: 25,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  actionsRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 36,
    zIndex: 20,
  },
  actionItem: {
    alignItems: "center",
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  actionLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
});
