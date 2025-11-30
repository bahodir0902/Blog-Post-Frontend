// src/services/notifications.ts

import api from "../api/api";
import type { CommentNotification } from "../types/notification";
import type { Paginated } from "../types/api";

/**
 * Fetch notification inbox with pagination
 */
export async function getNotificationInbox(params?: {
    page?: number;
    page_size?: number;
}) {
    const { page = 1, page_size = 20 } = params || {};
    const { data } = await api.get("notifications/comment/inbox/", {
        params: { page, page_size },
    });
    return data as Paginated<CommentNotification>;
}

/**
 * Mark multiple notifications as read
 */
export async function markNotificationsAsRead(ids: number[]) {
    const { data } = await api.post("notifications/comment/mark-as-read/", {
        ids,
    });
    return data;
}

/**
 * Delete multiple notifications
 */
export async function deleteNotifications(ids: number[]) {
    const { data } = await api.post("notifications/comment/delete-notifications/", {
        ids,
    });
    return data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
    const { data } = await api.get("notifications/comment/inbox/", {
        params: { page: 1, page_size: 1 },
    });
    const paginated = data as Paginated<CommentNotification>;
    return paginated.results[0]?.unread_count || 0;
}