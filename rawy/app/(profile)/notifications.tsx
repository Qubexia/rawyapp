import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, IconButton, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BellOff, CheckCheck } from 'lucide-react-native';

import { useNotifications, useMarkAllAsRead } from '@/hooks/queries/use-notifications';
import { NotificationItem } from '@/components/NotificationItem';
import { NotificationsSkeleton } from '@/components/ui';
import { Palette, Spacing } from '@/constants/theme';

export default function NotificationsScreen() {
    const theme = useTheme();
    const router = useRouter();

    const {
        data,
        isLoading,
        isRefetching,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useNotifications();

    const markAllAsRead = useMarkAllAsRead();

    const notifications = data?.pages.flatMap((page) => page.data) || [];
    const hasUnread = notifications.some((n) => !n.isRead);

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleMarkAllRead = () => {
        markAllAsRead.mutate();
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={s.center}>
                <BellOff size={48} color={theme.colors.onSurfaceVariant} strokeWidth={1} />
                <Text variant="titleMedium" style={{ marginTop: Spacing.md, color: theme.colors.onSurfaceVariant }}>
                    No notifications yet
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 }}>
                    When you get a like, follow or reply, we'll let you know here.
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[s.header, { borderBottomColor: Palette.light.border }]}>
                <View style={s.headerLeft}>
                    <IconButton
                        icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
                        onPress={() => router.back()}
                    />
                    <Text variant="titleLarge" style={[s.title, { color: theme.colors.onBackground }]}>
                        Notifications
                    </Text>
                </View>

                {hasUnread && (
                    <Button
                        mode="text"
                        onPress={handleMarkAllRead}
                        icon={() => <CheckCheck size={18} color={theme.colors.primary} />}
                        labelStyle={{ fontSize: 13, fontWeight: '700' }}
                    >
                        Mark all read
                    </Button>
                )}
            </View>

            {isLoading ? (
                <NotificationsSkeleton />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <NotificationItem notification={item} />}
                    contentContainerStyle={[
                        s.listContent,
                        notifications.length === 0 && { flex: 1, justifyContent: 'center' }
                    ]}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching && !isLoading}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <ActivityIndicator style={{ marginVertical: Spacing.md }} color={theme.colors.primary} />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: Spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 60,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: { fontWeight: '800' },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    listContent: {
        paddingBottom: Spacing.xxl,
    },
});
