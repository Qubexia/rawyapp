import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    NotificationResponse,
} from '../../services/notifications.service';
import type { PaginatedResponse } from '../../services/podcasts.service';
import { useAuthContext } from '@/context/auth-context';

export const notificationKeys = {
    all: ['notifications'] as const,
    lists: (userId?: string) => [...notificationKeys.all, 'list', userId || 'anonymous'] as const,
    list: (filters: string, userId?: string) => [...notificationKeys.lists(userId), { filters }] as const,
    unreadCount: (userId?: string) => [...notificationKeys.all, 'unreadCount', userId || 'anonymous'] as const,
};

export function useNotifications(options?: { enabled?: boolean }) {
    const { user } = useAuthContext();
    return useInfiniteQuery<PaginatedResponse<NotificationResponse>, Error>({
        queryKey: notificationKeys.lists(user?._id),
        queryFn: ({ pageParam = 1 }) => getNotifications(pageParam as number, 20),
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
        initialPageParam: 1,
        ...options,
    });
}

export function useUnreadCount(options?: { enabled?: boolean }) {
    const { user } = useAuthContext();
    return useQuery({
        queryKey: notificationKeys.unreadCount(user?._id),
        queryFn: () => getUnreadCount(),
        refetchInterval: 30000,
        ...options,
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => markAsRead(notificationId),
        onMutate: async (notificationId) => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            // Optimistically update lists
            queryClient.setQueryData(notificationKeys.lists(), (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((item: NotificationResponse) =>
                            item.id === notificationId ? { ...item, isRead: true } : item
                        ),
                    })),
                };
            });

            // Optimistically decrement count
            queryClient.setQueryData(notificationKeys.unreadCount(), (oldData: any) => {
                if (!oldData) return oldData;
                return { unreadCount: Math.max(0, oldData.unreadCount - 1) };
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => markAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });

            // Optimistically update lists
            queryClient.setQueryData(notificationKeys.lists(), (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((item: NotificationResponse) => ({ ...item, isRead: true })),
                    })),
                };
            });

            // Optimistically set count to 0
            queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: 0 });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}
