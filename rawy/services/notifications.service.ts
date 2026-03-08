import axiosClient from './axios-client';
import type { PaginatedResponse } from './podcasts.service';

export interface NotificationActor {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface NotificationResponse {
    id: string;
    recipientId: string;
    type: 'new_episode' | 'comment_like' | 'comment_reply' | 'new_follower';
    lastActor: NotificationActor | null;
    actorCount: number;
    targetId: string;
    targetModel: string;
    episodeId?: string;
    previewText?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UnreadCountResponse {
    unreadCount: number;
}

export async function getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<NotificationResponse>> {
    const { data } = await axiosClient.get<PaginatedResponse<NotificationResponse>>('/notifications', {
        params: { page, limit },
    });
    return data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await axiosClient.get<UnreadCountResponse>('/notifications/unread-count');
    return data;
}

export async function markAsRead(notificationId: string): Promise<{ message: string }> {
    const { data } = await axiosClient.patch<{ message: string }>(`/notifications/${notificationId}/read`);
    return data;
}

export async function markAllAsRead(): Promise<{ message: string }> {
    const { data } = await axiosClient.patch<{ message: string }>('/notifications/read-all');
    return data;
}
