import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { Text, Surface, IconButton, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, UserCheck, Users } from 'lucide-react-native';

import { useFollowing, useFollowStatus, useToggleFollow } from '@/hooks/queries/use-follows';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { resolveImageUrl } from '@/utils/url';
import type { FollowUser } from '@/services/follows.service';

function UserItem({ item }: { item: FollowUser }) {
    const theme = useTheme();
    const router = useRouter();
    const { user: currentUser } = useAuthContext();

    const { data: followStatus } = useFollowStatus(item.id, { enabled: !!currentUser });
    const toggleFollow = useToggleFollow(item.id);

    const isMe = currentUser?._id === item.id;
    const avatarUri = resolveImageUrl(item.avatarUrl);
    const initials = item.name.charAt(0).toUpperCase();

    const handleToggleFollow = () => {
        if (!currentUser) {
            router.push('/(auth)/login' as any);
            return;
        }
        toggleFollow.mutate(followStatus?.isFollowing || false);
    };

    return (
        <TouchableOpacity
            style={[s.itemRow, { borderBottomColor: Palette.light.border }]}
            onPress={() => router.push(`/user/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={[s.avatar, { backgroundColor: Palette.primary[50], borderColor: theme.colors.primary }]}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={s.avatarImg} />
                ) : (
                    <Text style={{ fontSize: 16, fontWeight: '700', color: Palette.primary[500] }}>
                        {initials}
                    </Text>
                )}
            </View>

            <View style={s.itemBody}>
                <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onSurface }} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.followerCount} followers
                </Text>
            </View>

            {!isMe && (
                <Button
                    mode={followStatus?.isFollowing ? 'outlined' : 'contained'}
                    onPress={handleToggleFollow}
                    loading={toggleFollow.isPending}
                    compact
                    style={s.followBtn}
                    labelStyle={s.followBtnLabel}
                >
                    {followStatus?.isFollowing ? 'Following' : 'Follow'}
                </Button>
            )}
        </TouchableOpacity>
    );
}

export default function FollowingScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const theme = useTheme();
    const router = useRouter();

    const {
        data,
        isLoading,
        isRefetching,
        refetch,
        fetchNextPage,
        hasNextPage,
    } = useFollowing(userId, { enabled: !!userId });

    const users = data?.pages.flatMap((page) => page.data) || [];

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }
        return (
            <View style={s.center}>
                <Users size={48} color={theme.colors.onSurfaceVariant} strokeWidth={1} />
                <Text variant="titleMedium" style={{ marginTop: Spacing.md, color: theme.colors.onSurfaceVariant }}>
                    Not following anyone yet
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
            <View style={[s.topBar, { borderBottomColor: Palette.light.border }]}>
                <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
                <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
                    Following
                </Text>
                <View style={{ width: 48 }} />
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UserItem item={item} />}
                contentContainerStyle={users.length === 0 ? s.emptyContainer : s.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                refreshControl={<RefreshControl refreshing={isRefetching && !isLoading} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={hasNextPage ? <ActivityIndicator style={{ marginVertical: Spacing.lg }} color={theme.colors.primary} /> : null}
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    listContainer: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xxl,
    },
    emptyContainer: {
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    itemBody: { flex: 1 },
    followBtn: {
        marginLeft: Spacing.md,
        borderRadius: Radius.md,
    },
    followBtnLabel: {
        marginHorizontal: 16,
        marginVertical: 6,
        fontSize: 13,
    },
});
