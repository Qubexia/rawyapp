import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Heart, MessageCircle, UserPlus, PlayCircle, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

import { NotificationResponse } from '@/services/notifications.service';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { resolveImageUrl } from '@/utils/url';
import { useMarkAsRead } from '@/hooks/queries/use-notifications';

interface NotificationItemProps {
    notification: NotificationResponse;
}

export function NotificationItem({ notification }: NotificationItemProps) {
    const theme = useTheme();
    const router = useRouter();
    const markAsRead = useMarkAsRead();

    const handlePress = () => {
        if (!notification.isRead) {
            markAsRead.mutate(notification.id);
        }

        if (notification.type === 'new_episode' && notification.episodeId) {
            router.push(`/episode/${notification.episodeId}` as any);
        } else if (notification.type === 'comment_like' || notification.type === 'comment_reply') {
            if (notification.episodeId) {
                router.push(`/episode/${notification.episodeId}` as any);
            }
        } else if (notification.type === 'new_follower' && notification.lastActor) {
            router.push(`/user/${notification.lastActor.id}` as any);
        }
    };

    const getActorText = () => {
        if (!notification.lastActor) return 'Someone';
        if (notification.actorCount > 1) {
            return `${notification.lastActor.name} and ${notification.actorCount - 1} others`;
        }
        return notification.lastActor.name;
    };

    const getConfig = () => {
        const actorText = getActorText();
        switch (notification.type) {
            case 'new_episode':
                return {
                    icon: <PlayCircle size={20} color={theme.colors.primary} />,
                    text: <><Text style={s.bold}>{actorText}</Text> published <Text style={s.bold}>{notification.previewText || 'a new episode'}</Text></>,
                    bg: Palette.primary[50],
                };
            case 'comment_like':
                return {
                    icon: <Heart size={20} color={theme.colors.error} />,
                    text: <><Text style={s.bold}>{actorText}</Text> liked your comment</>,
                    bg: '#FEE2E2', // red-50
                };
            case 'comment_reply':
                return {
                    icon: <MessageCircle size={20} color={Palette.primary[500]} />,
                    text: <><Text style={s.bold}>{actorText}</Text> replied to your comment</>,
                    bg: Palette.primary[50],
                };
            case 'new_follower':
                return {
                    icon: <UserPlus size={20} color={Palette.primary[500]} />,
                    text: <><Text style={s.bold}>{actorText}</Text> followed you</>,
                    bg: Palette.primary[50],
                };
            default:
                return {
                    icon: <Bell size={20} color={theme.colors.onSurfaceVariant} />,
                    text: <Text>{notification.previewText || 'New notification'}</Text>,
                    bg: theme.colors.surfaceVariant,
                };
        }
    };

    const config = getConfig();
    const dateFormatted = formatDistanceToNow(new Date(notification.updatedAt), { addSuffix: true });
    const avatarUri = resolveImageUrl(notification.lastActor?.avatarUrl);

    return (
        <TouchableOpacity
            style={[
                s.container,
                { backgroundColor: notification.isRead ? theme.colors.background : theme.colors.surface },
                !notification.isRead && { borderLeftWidth: 3, borderLeftColor: theme.colors.primary }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityLabel={`${config.text}`}
            accessibilityRole="button"
        >
            <View style={s.avatarContainer}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={s.avatar} />
                ) : (
                    <View style={[s.avatar, { backgroundColor: Palette.primary[100], alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontWeight: '700', color: Palette.primary[500], fontSize: 18 }}>
                            {notification.lastActor?.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
                <View style={[s.iconBadge, { backgroundColor: config.bg, borderColor: theme.colors.surface }]}>
                    {config.icon}
                </View>
            </View>

            <View style={s.content}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 20 }}>
                    {config.text}
                </Text>
                {notification.type === 'comment_reply' && notification.previewText && (
                    <Text variant="bodySmall" style={[s.preview, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                        "{notification.previewText}"
                    </Text>
                )}
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    {dateFormatted}
                </Text>
            </View>

            {!notification.isRead && (
                <View style={[s.unreadDot, { backgroundColor: theme.colors.primary }]} />
            )}
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Palette.light.border,
        alignItems: 'flex-start',
    },
    avatarContainer: {
        marginRight: Spacing.md,
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: Radius.full,
    },
    iconBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    bold: {
        fontWeight: '700',
    },
    preview: {
        marginTop: 4,
        fontStyle: 'italic',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 4,
        marginLeft: Spacing.sm,
    },
});
