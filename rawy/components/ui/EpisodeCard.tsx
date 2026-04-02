import React, { useState } from "react";
import { View, StyleSheet, Image, StyleProp, ViewStyle } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { Play, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Palette, Spacing, Radius } from "@/constants/theme";
import { Interactive } from "./Interactive";
import type { Episode } from "@/services/episodes.service";
import { resolveImageUrl } from "@/utils/url";

interface EpisodeCardProps {
  episode: Episode;
  style?: StyleProp<ViewStyle>;
}

export function EpisodeCard({ episode, style }: EpisodeCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const coverUri = resolveImageUrl(episode.podcast?.coverImageUrl);
  const [imgError, setImgError] = useState(false);

  return (
    <Interactive
      onPress={() => router.push(`/episode/${episode._id}` as any)}
      style={[styles.container, style]}
      accessibilityLabel={`Play episode: ${episode.title}`}
      accessibilityHint={`Listen to ${episode.title} from ${episode.podcast?.title || 'Podcast'}`}
      accessibilityRole="button"
    >
      <Surface
        style={[styles.card, { backgroundColor: Palette.light.surface }]}
        elevation={1}
      >
        <View style={[styles.thumb, { backgroundColor: Palette.primary[50] }]}>
          {coverUri && !imgError ? (
            <Image
              source={{ uri: coverUri }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <Play size={32} color={Palette.primary[500]} fill={Palette.primary[500]} />
          )}

          {/* Mini Play Button Overlay */}
          <View style={styles.playOverlay}>
            <View style={[styles.playButtonWrapper, { backgroundColor: theme.colors.primary }]}>
              <Play size={20} color={Palette.white.pure} fill={Palette.white.pure} />
            </View>
          </View>
        </View>

        <View style={styles.info}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {episode.title}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
          >
            {episode.podcast?.title || "Podcast"}
          </Text>

          <View style={styles.meta}>
            <Clock size={12} color={theme.colors.onSurfaceVariant} />
            <Text
              variant="labelSmall"
              style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
            >
              {episode.duration && episode.duration > 0
                ? episode.duration >= 3600
                  ? `${Math.floor(episode.duration / 3600)}h ${Math.floor((episode.duration % 3600) / 60)}m`
                  : `${Math.floor(episode.duration / 60)} min`
                : "—"}
            </Text>
          </View>
        </View>
      </Surface>
    </Interactive>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    maxWidth: '35%',
  },
  card: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    paddingBottom: Spacing.sm,
  },
  thumb: {
    width: "100%",
    aspectRatio: 1, // Make it square
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  playOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  playButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.black.pure,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  info: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  title: {
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 11,
  },
});
