import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, Surface, useTheme } from "react-native-paper";
import { Mic, Users, Radio } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Palette, Spacing, Radius } from "@/constants/theme";
import { resolveImageUrl } from "@/utils/url";

interface CreatorCardProps {
  creator: {
    _id: string;
    showName?: string;
    avatarUrl?: string;
    followerCount?: number;
    podcastCount?: number;
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const avatarUri = resolveImageUrl(creator.avatarUrl);
  const displayName = creator.showName || "Creator";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/creator/${creator._id}` as any)}
    >
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        elevation={2}
      >
        {/* Avatar with ring */}
        <View style={styles.avatarWrapper}>
          <View
            style={styles.avatarRing}
          >
            <View
              style={[styles.avatar, { backgroundColor: Palette.primary[100] }]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Mic size={26} color={Palette.primary[500]} />
              )}
            </View>
          </View>
        </View>

        {/* Name */}
        <Text
          variant="titleSmall"
          numberOfLines={1}
          style={[styles.name, { color: theme.colors.onSurface }]}
        >
          {displayName}
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {creator.followerCount !== undefined && (
            <View style={styles.statChip}>
              <Users size={10} color={Palette.primary[500]} />
              <Text variant="labelSmall" style={styles.statText}>
                {creator.followerCount >= 1000
                  ? `${(creator.followerCount / 1000).toFixed(1)}k`
                  : creator.followerCount.toString()}
              </Text>
            </View>
          )}
          {creator.podcastCount !== undefined && creator.podcastCount > 0 && (
            <View style={styles.statChip}>
              <Radio size={10} color={Palette.primary[500]} />
              <Text variant="labelSmall" style={styles.statText}>
                {creator.podcastCount}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  card: {
    width: 140,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderRadius: Radius.xl,
    gap: Spacing.xs,
  },
  avatarWrapper: {
    marginBottom: 2,
  },
  avatarRing: {
    width: AVATAR_SIZE + 5,
    height: AVATAR_SIZE + 5,
    borderRadius: (AVATAR_SIZE + 5) / 2,
    borderWidth: 1,
    borderColor: Palette.primary[200],
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Palette.primary[50],
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statText: {
    color: Palette.primary[500],
    fontWeight: "600",
  },
});
