// src/types/notification.ts

export type NotificationSender = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
};

export type CommentNotification = {
    id: number;
    sender: NotificationSender;
    receiver: NotificationSender;
    post: string;
    post_slug: string;
    comment: number;
    comment_id: number;
    message: string;
    is_read: boolean;
    unread_count: number;
    created_at: string;
    updated_at: string;
};

export type NotificationWebSocketMessage =
    | {
    type: "comment_notification";
    payload: CommentNotification;
}
    | {
    type: "mark_as_read_result";
    payload: { updated: number };
}
    | {
    type: "delete_notifications_result";
    payload: { deleted: number };
}
    | {
    type: "error";
    message: string;
};

export type MarkAsReadPayload = {
    ids?: number[];
    id?: number;
};

export type DeleteNotificationsPayload = {
    ids?: number[];
    id?: number;
};