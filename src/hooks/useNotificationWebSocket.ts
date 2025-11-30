// src/hooks/useNotificationWebSocket.ts

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import type {
    CommentNotification,
    NotificationWebSocketMessage,
    MarkAsReadPayload,
    DeleteNotificationsPayload,
} from "../types/notification";

type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

export function useNotificationWebSocket() {
    const { accessToken } = useAuth();
    const [status, setStatus] = useState<WebSocketStatus>("disconnected");
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<CommentNotification[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // 1 second

    // Calculate exponential backoff delay
    const getReconnectDelay = useCallback(() => {
        return Math.min(
            baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current),
            30000 // Max 30 seconds
        );
    }, []);

    // Mark notifications as read
    const markAsRead = useCallback((payload: MarkAsReadPayload) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                    type: "mark_as_read",
                    payload,
                })
            );
        }
    }, []);

    // Delete notifications
    const deleteNotifications = useCallback((payload: DeleteNotificationsPayload) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                    type: "delete_notifications",
                    payload,
                })
            );
        }
    }, []);

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (!accessToken) {
            setStatus("disconnected");
            return;
        }

        // Prevent multiple connections
        if (
            wsRef.current &&
            (wsRef.current.readyState === WebSocket.CONNECTING ||
                wsRef.current.readyState === WebSocket.OPEN)
        ) {
            return;
        }

        setStatus("connecting");

        const wsUrl = import.meta.env.VITE_WS_URL || "ws://127.0.0.1:8000";
        const ws = new WebSocket(
            `${wsUrl}ws/notifications/comments/?token=${accessToken}`
        );

        ws.onopen = () => {
            console.log("✅ WebSocket connected");
            setStatus("connected");
            reconnectAttemptsRef.current = 0; // Reset on successful connection
        };

        ws.onmessage = (event) => {
            try {
                const message: NotificationWebSocketMessage = JSON.parse(event.data);

                if (message.type === "comment_notification") {
                    const notification = message.payload;

                    // Add to notifications list (prepend)
                    setNotifications((prev) => [notification, ...prev]);

                    // Update unread count
                    setUnreadCount((prev) => prev + 1);

                    // Show browser notification if permission granted
                    if (Notification.permission === "granted") {
                        new Notification(notification.message, {
                            body: `In: ${notification.post}`,
                            icon: "/notification-icon.png",
                            tag: `comment-${notification.id}`,
                        });
                    }
                } else if (message.type === "mark_as_read_result") {
                    console.log(`✅ Marked ${message.payload.updated} notifications as read`);
                } else if (message.type === "delete_notifications_result") {
                    console.log(`✅ Deleted ${message.payload.deleted} notifications`);
                } else if (message.type === "error") {
                    console.error("❌ WebSocket error:", message.message);
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket error:", error);
            setStatus("error");
        };

        ws.onclose = (event) => {
            console.log("🔌 WebSocket closed:", event.code, event.reason);
            setStatus("disconnected");
            wsRef.current = null;

            // Attempt reconnection with exponential backoff
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = getReconnectDelay();
                console.log(
                    `🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`
                );

                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttemptsRef.current++;
                    connect();
                }, delay);
            } else {
                console.log("❌ Max reconnection attempts reached");
            }
        };

        wsRef.current = ws;
    }, [accessToken, getReconnectDelay]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close(1000, "Client disconnecting");
            wsRef.current = null;
        }

        setStatus("disconnected");
        reconnectAttemptsRef.current = 0;
    }, []);

    // Connect on mount when token is available
    useEffect(() => {
        if (accessToken) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [accessToken, connect, disconnect]);

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Clear notification from list when marked as read
    const clearNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    // Remove notification from list when deleted
    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => {
            const notification = prev.find((n) => n.id === id);
            const wasUnread = notification && !notification.is_read;

            if (wasUnread) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }

            return prev.filter((n) => n.id !== id);
        });
    }, []);

    return {
        status,
        unreadCount,
        notifications,
        markAsRead,
        deleteNotifications,
        clearNotification,
        removeNotification,
        connect,
        disconnect,
        setUnreadCount,
    };
}