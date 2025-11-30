// src/contexts/NotificationContext.tsx

import React, { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { useNotificationWebSocket } from "../hooks/useNotificationWebSocket";
import { getUnreadCount } from "../services/notifications";

type NotificationContextType = ReturnType<typeof useNotificationWebSocket>;

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error(
            "useNotifications must be used within NotificationProvider"
        );
    }
    return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { accessToken } = useAuth();
    const wsHook = useNotificationWebSocket();

    // Fetch initial unread count from API
    const { data: initialUnreadCount } = useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: getUnreadCount,
        enabled: !!accessToken,
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: true,
    });

    // Sync initial count with WebSocket state
    useEffect(() => {
        if (initialUnreadCount !== undefined) {
            wsHook.setUnreadCount(initialUnreadCount);
        }
    }, [initialUnreadCount, wsHook.setUnreadCount]);

    return (
        <NotificationContext.Provider value={wsHook}>
            {children}
        </NotificationContext.Provider>
    );
}