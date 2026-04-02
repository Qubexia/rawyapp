import React, { useState } from "react";
import { View, StyleSheet, Image, StyleProp, ViewStyle } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { Play, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Palette, Spacing, Radius } from "@/constants/theme";
import { Interactive } from "./Interactive";
import type { Episode } from "@/services/episodes.service";
import { resolveImageUrl } from "@/utils/url";
import { formatCount } from "@/utils/format";

interface EpisodeRowProps {
  episode: Episode;
  style?: StyleProp<ViewStyle>;
  showPodcastName?: boolean;
  rightAction?: React.ReactNode;
}

export function EpisodeRow({
  episode,
  style,
  showPodcastName = true,
  rightAction,
}: EpisodeRowProps) {
  const theme = useTheme();
  const router = useRouter();

  const coverUri = resolveImageUrl(episode.podcast?.coverImageUrl);
  const [imgError, setImgError] = useState(false);

  return (
    <Interactive
      onPress={() => router.push(`/episode/${episode._id}` as any)}
      style={style}
      accessibilityLabel={`Play episode: ${episode.title}`}
      accessibilityHint={`Listen to ${episode.title}`}
      accessibilityRole="button"
    >
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: Palette.light.surface,
          },
        ]}
        elevation={1}
      >
        <View
          style={[
            styles.thumb,
            { backgroundColor: Palette.primary[50], overflow: "hidden" },
          ]}
        >
          {coverUri && !imgError ? (
            <Image
              source={{ uri: coverUri }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <Play
              size={20}
              color={Palette.primary[500]}
              fill={Palette.primary[500]}
            />
          )}
        </View>
        <View style={styles.info}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {episode.title}
          </Text>
          {showPodcastName && (
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {episode.podcast?.title || "Podcast"}
            </Text>
          )}
          <View style={styles.meta}>
            <Clock size={12} color={theme.colors.onSurfaceVariant} />
            <Text
              variant="labelSmall"
              style={[
                styles.metaText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {episode.duration && episode.duration > 0
                ? episode.duration >= 3600
                  ? `${Math.floor(episode.duration / 3600)}h ${Math.floor((episode.duration % 3600) / 60)}min`
                  : `${Math.floor(episode.duration / 60)} min`
                : "—"}
            </Text>
            {episode.viewsCount != null && episode.viewsCount > 0 && (
              <Text
                variant="labelSmall"
                style={[
                  styles.metaText,
                  { color: theme.colors.onSurfaceVariant, marginLeft: 8 },
                ]}
              >
                {formatCount(episode.viewsCount)} views
              </Text>
            )}
          </View>
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </Surface>
    </Interactive>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    marginLeft: 4,
  },
  rightAction: {
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
});
