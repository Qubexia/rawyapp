/**
 * Full-screen Player screen — immersive modal with cover art, seekable
 * progress bar, skip ±15s, like, share, comments link.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  GestureResponderEvent,
  Share,
  Platform,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { generateEpisodeLink } from "@/utils/deep-link";
import * as Haptics from 'expo-haptics';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Share2,
  MessageCircle,
  Music2,
} from "lucide-react-native";

import { AnimatedHeart } from "@/components/ui";

import { usePlayer } from "@/context/player-context";
import { resolveImageUrl } from "@/utils/url";
import { Spacing, Radius } from "@/constants/theme";
import { useLikeStatus, useToggleLike } from "@/hooks/queries/use-likes";
import { useAuthContext } from "@/context/auth-context";

const { width: SCREEN_W } = Dimensions.get("window");
const COVER_SIZE = SCREEN_W - Spacing.xl * 2;

function formatMs(ms: number) {
  if (!ms || isNaN(ms) || ms < 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatViews(count: number | undefined): string {
  if (!count || count <= 0) return "0 views";
  if (count < 1000) return `${count} views`;
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const { user } = useAuthContext();

  const {
    currentEpisode,
    isPlaying,
    position,
    duration,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
  } = usePlayer();

  const { data: likeStatus } = useLikeStatus(currentEpisode?._id ?? "", {
    enabled: !!user && !!currentEpisode,
  });
  const toggleLike = useToggleLike(currentEpisode?._id ?? "");

  const coverUri = resolveImageUrl(currentEpisode?.podcast?.coverImageUrl);
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  // ── Seekable progress bar ─────────────────────────────────────────────────
  const [barWidth, setBarWidth] = useState(1);

  const handleSeek = useCallback(
    (e: GestureResponderEvent) => {
      const x = e.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(x / barWidth, 1));
      Haptics.selectionAsync().catch(() => {});
      seek(ratio * duration);
    },
    [barWidth, duration, seek],
  );

  const handleShare = async () => {
    if (!currentEpisode) return;
    try {
      const shareUrl = generateEpisodeLink(currentEpisode._id);
      // On Android, if message contains text + custom scheme URL, some apps fail to linkify the URL.
      // Providing just the URL or ensuring it is cleanly separated often helps.
      const message = Platform.OS === 'android' 
        ? `Listen to "${currentEpisode.title}" on Rawy: ${shareUrl}` 
        : `Listen to "${currentEpisode.title}" from "${currentEpisode.podcast?.title}" on Rawy!`;
        
      await Share.share({
        message,
        url: shareUrl,
      });
    } catch {}
  };

  if (!currentEpisode) {
    return null;
  }

  // Gradient colours: dark rich tones
  const gradTop = "#1A1A2E";
  const gradMid = "#252540";
  const gradBot = "#0D0D1A";

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={[gradTop, gradMid, gradBot]}
        style={StyleSheet.absoluteFill}
      />

      {/* Blurred cover art background (faint) */}
      {coverUri && (
        <Image source={{ uri: coverUri }} style={s.bgCover} blurRadius={40} />
      )}
      {/* Dark overlay over blurred bg */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(10,10,20,0.72)" },
        ]}
      />

      <SafeAreaView style={s.safe}>
        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ChevronDown size={28} color="#FFF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={s.topMeta}>
            <Text style={s.nowPlayingLabel}>NOW PLAYING</Text>
            <Text style={s.podcastName} numberOfLines={1}>
              {currentEpisode.podcast?.title}
            </Text>
          </View>

          <View style={{ width: 28 }} />
        </View>

        {/* ── Cover art ── */}
        <View style={s.coverWrapper}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={s.cover} />
          ) : (
            <View style={[s.cover, s.coverFallback]}>
              <Music2
                size={72}
                color="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
              />
            </View>
          )}
        </View>

        {/* ── Title & like ── */}
        <View style={s.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.episodeTitle} numberOfLines={2}>
              {currentEpisode.title}
            </Text>
            <TouchableOpacity
              onPress={() =>
                currentEpisode.podcast?._id &&
                router.push(`/podcast/${currentEpisode.podcast._id}` as any)
              }
            >
              <Text style={s.podcastLink} numberOfLines={1}>
                {currentEpisode.podcast?.title}
              </Text>
            </TouchableOpacity>
            <Text style={[s.podcastLink, { marginTop: 2, fontSize: 12 }]}>
              {formatViews(currentEpisode.viewsCount)}
            </Text>
          </View>
          <AnimatedHeart
            size={26}
            isLiked={likeStatus?.isLiked || false}
            activeColor="#EF4444"
            inactiveColor="rgba(255,255,255,0.7)"
            onPress={() => {
              if (!user) {
                router.push("/(auth)/login" as any);
                return;
              }
              toggleLike.mutate(likeStatus?.isLiked || false);
            }}
            style={s.likeBtn}
          />
        </View>

        {/* ── Seekable progress bar ── */}
        <View style={s.progressSection}>
          <TouchableOpacity
            activeOpacity={1}
            style={s.progressTrackWrapper}
            onPress={handleSeek}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          >
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
              {/* Thumb dot */}
              <View style={[s.progressThumb, { left: `${progress * 100}%` }]} />
            </View>
          </TouchableOpacity>
          <View style={s.timeRow}>
            <Text style={s.timeText}>{formatMs(position)}</Text>
            <Text style={s.timeText}>{formatMs(duration)}</Text>
          </View>
        </View>

        {/* ── Controls ── */}
        <View style={s.controls}>
          <TouchableOpacity style={s.ctrlSkip} onPress={skipBackward}>
            <SkipBack
              size={32}
              color="rgba(255,255,255,0.85)"
              strokeWidth={2}
            />
            <Text style={s.skipLabel}>15</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.playBtn}
            onPress={togglePlay}
            activeOpacity={0.85}
          >
            {isPlaying ? (
              <Pause size={36} color="#050505" fill="#FFF" />
            ) : (
              <Play size={36} color="#000000" fill="#000000" />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={s.ctrlSkip} onPress={skipForward}>
            <SkipForward
              size={32}
              color="rgba(255,255,255,0.85)"
              strokeWidth={2}
            />
            <Text style={s.skipLabel}>15</Text>
          </TouchableOpacity>
        </View>

        {/* ── Action row ── */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionItem} onPress={handleShare}>
            <Share2 size={22} color="rgba(255,255,255,0.7)" />
            <Text style={s.actionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.actionItem}
            onPress={() => {
              router.back();
              router.push(`/episode/${currentEpisode._id}` as any);
            }}
          >
            <MessageCircle size={22} color="rgba(255,255,255,0.7)" />
            <Text style={s.actionLabel}>Comments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  bgCover: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    resizeMode: "cover",
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  topMeta: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
  },
  nowPlayingLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  podcastName: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  // Cover
  coverWrapper: {
    alignSelf: "center",
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: Radius.xl,
    resizeMode: "cover",
  },
  coverFallback: {
    backgroundColor: "#252540",
    alignItems: "center",
    justifyContent: "center",
  },

  // Title row
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  podcastLink: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
  },
  likeBtn: {
    marginLeft: Spacing.md,
    padding: Spacing.xs,
  },

  // Progress
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressTrackWrapper: {
    paddingVertical: Spacing.lg, // increased touch target
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "visible",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -5,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  timeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },

  // Controls
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  ctrlSkip: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    position: "relative",
  },
  skipLabel: {
    position: "absolute",
    bottom: 4,
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "700",
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  // Action row
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xxl,
  },
  actionItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
