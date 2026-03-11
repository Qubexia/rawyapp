/**
 * Episode detail screen — info, description, comments.
 * Player controls live in the separate /player screen.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Share,
  RefreshControl,
  Image,
  ActivityIndicator,
  Keyboard,
  Animated as RNAnimated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Surface, IconButton, useTheme, Chip } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Play,
  Pause,
  Clock,
  Send,
  Share2,
  Music2,
  X,
  Eye,
} from "lucide-react-native";

import { useEpisode, useEpisodes } from "@/hooks/queries/use-episodes";
import { useLikeStatus, useToggleLike } from "@/hooks/queries/use-likes";
import {
  useComments,
  useCreateComment,
  useCreateReply,
} from "@/hooks/queries/use-comments";
import { useAuthContext } from "@/context/auth-context";
import { Palette, Spacing, Radius } from "@/constants/theme";
import type { Comment } from "@/services/comments.service";
import { CommentItem } from "@/components/CommentItem";
import { resolveImageUrl } from "@/utils/url";
import { usePlayer } from "@/context/player-context";
import { generateEpisodeLink } from "@/utils/deep-link";
import { EpisodeRow, ErrorBoundary } from "@/components/ui";

// Space to reserve at the bottom
const MINI_PLAYER_CLEARANCE = 92; // 77px card + 15px gap

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [commentText, setCommentText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const sheetTranslateY = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        RNAnimated.timing(sheetTranslateY, {
          toValue: -e.endCoordinates.height,
          duration: Platform.OS === "ios" ? e.duration || 250 : 200,
          useNativeDriver: true,
        }).start();
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        RNAnimated.timing(sheetTranslateY, {
          toValue: 0,
          duration: Platform.OS === "ios" ? e.duration || 250 : 200,
          useNativeDriver: true,
        }).start();
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [sheetTranslateY]);

  // Animation state
  const playBtnScale = useSharedValue(1);
  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  // Data queries
  const { data: episode, isLoading } = useEpisode(id);
  const { data: likeStatus } = useLikeStatus(id, { enabled: !!user });
  const toggleLike = useToggleLike(id);
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useComments(id);
  const { data: moreEpisodesData } = useEpisodes(episode?.podcast?._id);

  const createComment = useCreateComment(id);
  const createReply = useCreateReply(id, replyTo?.id ?? "");

  const { currentEpisode, isPlaying, playEpisode, togglePlay, trackView } =
    usePlayer();
  const isCurrentPlaying = currentEpisode?._id === id;

  // Record view on mount
  React.useEffect(() => {
    if (id) {
      trackView(id).catch(() => {});
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchComments();
    setRefreshing(false);
  }, [refetchComments]);

  const handlePlayPress = async () => {
    if (!episode) return;
    if (isCurrentPlaying) {
      await togglePlay();
    } else {
      await playEpisode(episode);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = generateEpisodeLink(id);
      await Share.share({
        message: `Listen to "${episode?.title}" from "${episode?.podcast?.title}" on Rawy!\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  const handleSend = async () => {
    const t = commentText.trim();
    if (!t) return;
    if (replyTo) {
      await createReply.mutateAsync(t);
      setReplyTo(null);
    } else {
      await createComment.mutateAsync(t);
    }
    setCommentText("");
    setShowCommentInput(false);
    Keyboard.dismiss();
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[s.root, { backgroundColor: theme.colors.background }]}
      >
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const coverUri = resolveImageUrl(episode?.podcast?.coverImageUrl);
  const comments = commentsData?.pages.flatMap((p) => p.data) ?? [];
  const nextUp = (moreEpisodesData?.pages.flatMap((p) => p.data) || []).filter(
    (e) => e._id !== id,
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      key={item._id}
      episodeId={id}
      comment={item}
      onReply={(commentId, name) => {
        setReplyTo({ id: commentId, name });
        setShowCommentInput(true);
      }}
      creatorId={episode?.creator?._id}
    />
  );

  const ListHeader = () => (
    <View style={{ paddingBottom: Spacing.lg }}>
      {/* ── Top Section (Centered) ── */}
      <View style={s.centeredHeader}>
        <Surface
          style={[s.largeCover, { backgroundColor: Palette.primary[100] }]}
          elevation={4}
        >
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={s.coverImg} />
          ) : (
            <Music2 size={80} color={Palette.primary[500]} strokeWidth={1} />
          )}
        </Surface>

        <Text
          variant="headlineSmall"
          style={[s.largeTitle, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {episode?.title}
        </Text>

        <TouchableOpacity
          onPress={() =>
            episode?.podcast?._id &&
            router.push(`/podcast/${episode.podcast._id}` as any)
          }
        >
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.primary, fontWeight: "700" }}
          >
            {episode?.podcast?.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            episode?.creator?._id &&
            router.push(`/creator/${episode.creator._id}` as any)
          }
          style={{ marginTop: 4 }}
        >
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            by {episode?.creator?.name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Play Control ── */}
      <View style={s.playControlSection}>
        <Animated.View style={playBtnAnimStyle}>
          <TouchableOpacity
            style={[s.mainPlayBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handlePlayPress}
            onPressIn={() => (playBtnScale.value = withSpring(0.9))}
            onPressOut={() => (playBtnScale.value = withSpring(1))}
            activeOpacity={1}
          >
            {isCurrentPlaying && isPlaying ? (
              <Pause size={32} color="#FFF" fill="#FFF" />
            ) : (
              <Play
                size={32}
                color="#FFF"
                fill="#FFF"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        {episode?.duration ? (
          <Text
            variant="labelLarge"
            style={[s.durationText, { color: theme.colors.onSurfaceVariant }]}
          >
            {Math.floor(episode.duration / 60)}m {episode.duration % 60}s
          </Text>
        ) : null}
      </View>

      {/* ── Action bar ── */}
      <Surface
        style={[s.interactionBar, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <TouchableOpacity
          style={s.interactionItem}
          onPress={() => {
            if (!user) {
              router.push("/(auth)/login" as any);
              return;
            }
            toggleLike.mutate(likeStatus?.isLiked || false);
          }}
        >
          <Heart
            size={20}
            color={
              likeStatus?.isLiked ? "#EF4444" : theme.colors.onSurfaceVariant
            }
            fill={likeStatus?.isLiked ? "#EF4444" : "transparent"}
          />
          <Text variant="labelSmall" style={s.interactionLabel}>
            {likeStatus?.likesCount ?? episode?.likesCount ?? 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.interactionItem}
          onPress={() => {
            if (!user) {
              router.push("/(auth)/login" as any);
              return;
            }
            setShowCommentInput(true);
          }}
        >
          <MessageCircle
            size={20}
            color={
              showCommentInput
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
          />
          <Text
            variant="labelSmall"
            style={[
              s.interactionLabel,
              showCommentInput && { color: theme.colors.primary },
            ]}
          >
            {episode?.commentsCount ?? comments.length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.interactionItem} onPress={handleShare}>
          <Share2 size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={s.interactionLabel}>
            Share
          </Text>
        </TouchableOpacity>

        <View style={s.interactionItem}>
          <Eye size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={s.interactionLabel}>
            {episode?.viewsCount ?? 0}
          </Text>
        </View>
      </Surface>

      {/* ── Description ── */}
      {episode?.description && (
        <View style={s.descriptionSection}>
          <Text variant="titleMedium" style={s.sectionTitle}>
            About this episode
          </Text>
          <View>
            <Text
              variant="bodyMedium"
              style={[
                s.descriptionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
              numberOfLines={isDescExpanded ? undefined : 3}
            >
              {episode.description}
            </Text>
            {episode.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setIsDescExpanded(!isDescExpanded)}
                style={{ marginTop: 4 }}
              >
                <Text
                  variant="labelLarge"
                  style={{ color: theme.colors.primary, fontWeight: "700" }}
                >
                  {isDescExpanded ? "Show less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Next Up ── */}
      {nextUp.length > 0 && (
        <View style={s.nextUpSection}>
          <Text variant="titleMedium" style={s.sectionTitle}>
            Next Up
          </Text>
          <FlatList
            horizontal
            data={nextUp.slice(0, 5)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={{ width: 280, marginRight: Spacing.md }}>
                <Surface
                  style={{ borderRadius: Radius.md, overflow: "hidden" }}
                  elevation={1}
                >
                  <EpisodeRow episode={item} />
                </Surface>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.sm }}
          />
        </View>
      )}

      {/* ── Divider ── */}
      <View
        style={[s.divider, { backgroundColor: theme.colors.surfaceVariant }]}
      />

      {/* ── Comments Header ── */}
      <View style={s.commentsSectionHeader}>
        <Text variant="titleLarge" style={s.sectionTitle}>
          Comments
        </Text>
        {comments.length > 0 && (
          <Chip
            compact
            style={{ backgroundColor: theme.colors.surfaceVariant }}
          >
            {comments.length}
          </Chip>
        )}
      </View>

      {/* ── Comment prompt ── */}
      {user ? (
        <TouchableOpacity
          style={[
            s.commentPrompt,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceVariant,
            },
          ]}
          onPress={() => setShowCommentInput(true)}
          activeOpacity={0.7}
        >
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, flex: 1 }}
          >
            Write a comment...
          </Text>
          <MessageCircle size={18} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.colors.background }]}
    >
      <ErrorBoundary onReset={onRefresh}>
        <View style={s.topBar}>
          <IconButton
            icon={() => (
              <ArrowLeft size={24} color={theme.colors.onBackground} />
            )}
            onPress={() => router.back()}
          />
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onBackground, fontWeight: "600" }}
          >
            Episode
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <View
          style={{
            flex: 1,
            marginBottom: currentEpisode ? MINI_PLAYER_CLEARANCE : 0,
          }}
        >
          <FlatList
            data={comments}
            keyExtractor={(i, idx) => (i?._id ? String(i._id) : String(idx))}
            renderItem={renderComment}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={{ paddingBottom: Spacing.xxl }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === "android" ? true : false}
            maxToRenderPerBatch={8}
            windowSize={10}
            initialNumToRender={5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={() =>
              !commentsLoading ? (
                <TouchableOpacity
                  style={s.emptyC}
                  onPress={() => {
                    if (!user) {
                      router.push("/(auth)/login" as any);
                      return;
                    }
                    setShowCommentInput(true);
                  }}
                >
                  <MessageCircle
                    size={28}
                    color={theme.colors.primary}
                    strokeWidth={1}
                  />
                  <Text
                    variant="bodySmall"
                    style={{
                      color: theme.colors.primary,
                      marginTop: 8,
                      fontWeight: "700",
                    }}
                  >
                    Be the first to comment!
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
          <Modal
            visible={showCommentInput}
            transparent
            animationType="slide"
            onRequestClose={() => {
              setShowCommentInput(false);
              setReplyTo(null);
              Keyboard.dismiss();
            }}
          >
            <TouchableOpacity
              style={s.modalBackdrop}
              activeOpacity={1}
              onPress={() => {
                setShowCommentInput(false);
                setReplyTo(null);
                Keyboard.dismiss();
              }}
            >
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <RNAnimated.View
                  style={{ transform: [{ translateY: sheetTranslateY }] }}
                >
                  <Surface
                    style={[
                      s.commentSheet,
                      { backgroundColor: theme.colors.surface },
                    ]}
                    elevation={4}
                  >
                    {/* Handle bar */}
                    <View
                      style={[
                        s.sheetHandle,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ]}
                    />

                    {/* Header */}
                    <View style={s.sheetHeader}>
                      <Text
                        variant="titleMedium"
                        style={{
                          fontWeight: "700",
                          color: theme.colors.onSurface,
                        }}
                      >
                        {replyTo ? `Reply to ${replyTo.name}` : "Add a comment"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowCommentInput(false);
                          setReplyTo(null);
                          setCommentText("");
                        }}
                      >
                        <X size={22} color={theme.colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>

                    {/* Input */}
                    <TextInput
                      autoFocus
                      style={[
                        s.modalInput,
                        {
                          color: theme.colors.onSurface,
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.surfaceVariant,
                        },
                      ]}
                      placeholder={
                        replyTo
                          ? `Reply to ${replyTo.name}...`
                          : "Share your thoughts..."
                      }
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                    />
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        textAlign: "right",
                        marginTop: 4,
                      }}
                    >
                      {commentText.length}/500
                    </Text>

                    {/* Actions */}
                    <View style={s.sheetActions}>
                      <TouchableOpacity
                        style={s.cancelBtn}
                        onPress={() => {
                          setShowCommentInput(false);
                          setReplyTo(null);
                          setCommentText("");
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.onSurfaceVariant,
                            fontWeight: "600",
                            fontSize: 15,
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          s.postBtn,
                          {
                            backgroundColor: commentText.trim()
                              ? theme.colors.primary
                              : theme.colors.surfaceVariant,
                          },
                        ]}
                        onPress={handleSend}
                        disabled={
                          !commentText.trim() ||
                          createComment.isPending ||
                          createReply.isPending
                        }
                      >
                        {createComment.isPending || createReply.isPending ? (
                          <ActivityIndicator size={18} color="#FFF" />
                        ) : (
                          <>
                            <Send
                              size={16}
                              color={
                                commentText.trim()
                                  ? "#FFF"
                                  : theme.colors.onSurfaceVariant
                              }
                            />
                            <Text
                              style={{
                                color: commentText.trim()
                                  ? "#FFF"
                                  : theme.colors.onSurfaceVariant,
                                fontWeight: "700",
                                fontSize: 15,
                                marginLeft: 6,
                              }}
                            >
                              {replyTo ? "Reply" : "Post"}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Surface>
                </RNAnimated.View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </View>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xs,
    height: 56,
  },

  centeredHeader: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  largeCover: {
    width: 200,
    height: 200,
    borderRadius: Radius.xxl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  coverImg: { width: "100%", height: "100%", resizeMode: "cover" },
  largeTitle: {
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 4,
  },

  playControlSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Palette.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  durationText: {
    marginTop: Spacing.sm,
    fontWeight: "600",
  },

  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
  },
  interactionItem: {
    alignItems: "center",
    flex: 1,
  },
  interactionLabel: {
    color: "rgba(0,0,0,0.5)",
    marginTop: 4,
    fontWeight: "600",
  },

  descriptionSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  nextUpSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: "900",
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    lineHeight: 22,
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  commentsSectionHeader: {
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  emptyC: { alignItems: "center", paddingVertical: Spacing.xl },

  // Comment prompt (inside list header)
  commentPrompt: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.sm,
  },

  // Modal bottom sheet
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  commentSheet: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 100,
    maxHeight: 160,
    lineHeight: 22,
  },
  sheetActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  postBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    minWidth: 90,
    justifyContent: "center",
  },
});
