// src/pages/Notifications.tsx - UPDATED WITH DELETE

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, Trash2, MessageCircle } from "lucide-react";
import { getNotificationInbox, markNotificationsAsRead, deleteNotifications } from "../services/notifications";
import { useNotifications } from "../contexts/NotificationContext";
import type { CommentNotification } from "../types/notification";

export default function Notifications() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { removeNotification } = useNotifications();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["notifications", "inbox", page],
        queryFn: () => getNotificationInbox({ page, page_size: 20 }),
        staleTime: 10000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNotifications,
        onSuccess: (_, ids) => {
            // Remove from local state
            ids.forEach((id) => removeNotification(id));
            // Refresh the list
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const notifications = data?.results || [];
    const totalPages = data ? Math.ceil(data.count / 20) : 1;

    const toggleSelectMode = () => {
        setIsSelectMode((prev) => !prev);
        setSelectedIds(new Set());
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allIds = notifications.map((n) => n.id);
        setSelectedIds(new Set(allIds));
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size > 0) {
            const idsArray = Array.from(selectedIds);
            deleteMutation.mutate(idsArray);
            setSelectedIds(new Set());
        }
    };

    const handleNotificationClick = (notification: CommentNotification) => {
        // Mark as read
        if (!notification.is_read) {
            markAsReadMutation.mutate([notification.id]);
        }

        // Navigate to post with comment hash
        navigate(`/post/${notification.post_slug}#comment-${notification.comment_id}`);
    };

    const handleDelete = (e: React.MouseEvent, notificationId: number) => {
        e.stopPropagation(); // Prevent notification click
        deleteMutation.mutate([notificationId]);
    };

    const handleMarkAllAsRead = () => {
        const unreadIds = notifications
            .filter((n) => !n.is_read)
            .map((n) => n.id);

        if (unreadIds.length > 0) {
            markAsReadMutation.mutate(unreadIds);
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('time.justNow');
        if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
        if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
        if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
        if (diffDays < 30) return t('time.weeksAgo', { count: Math.floor(diffDays / 7) });
        if (diffDays < 365) return t('time.monthsAgo', { count: Math.floor(diffDays / 30) });
        return t('time.yearsAgo', { count: Math.floor(diffDays / 365) });
    };

    const getSenderInitials = (sender: CommentNotification["sender"]) => {
        const first = sender.first_name?.[0] || "";
        const last = sender.last_name?.[0] || "";
        return (first + last).toUpperCase() || sender.email?.[0]?.toUpperCase() || "?";
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] py-8">
            <div className="container-responsive max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            {t('notifications.title')}
                        </h1>

                        <div className="flex items-center gap-3">
                            {notifications.length > 0 && notifications.some((n) => !n.is_read) && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={markAsReadMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)] transition-colors disabled:opacity-50"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    {t('notifications.markAllRead')}
                                </button>
                            )}

                            {!isSelectMode ? (
                                <button
                                    onClick={toggleSelectMode}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                                >
                                    {t('notifications.select')}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                                    >
                                        {t('notifications.selectAll')}
                                    </button>
                                    <button
                                        onClick={toggleSelectMode}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    {selectedIds.size > 0 && (
                                        <button
                                            onClick={handleDeleteSelected}
                                            disabled={deleteMutation.isPending}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t('notifications.deleteSelected', { count: selectedIds.size })}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">
                        {t('notifications.subtitle')}
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)]" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-[var(--color-surface-elevated)] rounded w-3/4" />
                                        <div className="h-3 bg-[var(--color-surface-elevated)] rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="card p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                            {t('notifications.loadError')}
                        </h3>
                        <p className="text-[var(--color-text-secondary)]">
                            {t('common.tryAgainLater')}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && notifications.length === 0 && (
                    <div className="card p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-surface-elevated)] mb-4">
                            <Bell className="w-10 h-10 text-[var(--color-text-tertiary)]" />
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                            {t('notifications.noNotifications')}
                        </h3>
                        <p className="text-[var(--color-text-secondary)]">
                            {t('notifications.noNotificationsDescription')}
                        </p>
                    </div>
                )}

                {/* Notifications List */}
                {!isLoading && !isError && notifications.length > 0 && (
                    <div className="space-y-2">
                        {notifications.map((notification) => {
                            const Content = (
                                <div className="flex gap-4 pr-8">
                                    {isSelectMode && (
                                        <div className="flex items-center pl-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(notification.id)}
                                                onChange={() => toggleSelect(notification.id)}
                                                className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]"
                                            />
                                        </div>
                                    )}
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-semibold">
                                            {getSenderInitials(notification.sender)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <p className="text-sm text-[var(--color-text-primary)] font-medium">
                                                <span className="font-semibold">
                                                    {notification.sender.full_name}
                                                </span>{" "}
                                                {notification.sender.first_name} {notification.sender.last_name} replied to your comment
                                            </p>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-500)] flex-shrink-0 mt-1.5" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] mb-2">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span className="truncate">{notification.post}</span>
                                            <span>•</span>
                                            <span>{getRelativeTime(notification.created_at)}</span>
                                        </div>

                                        {!isSelectMode && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] font-medium group-hover:underline">
                                                    View comment
                                                </span>
                                                <span className="text-[var(--color-text-tertiary)]">→</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );

                            return (
                                <div
                                    key={notification.id}
                                    className={`relative card p-4 transition-all hover:shadow-md group ${
                                        isSelectMode && selectedIds.has(notification.id)
                                            ? "border-2 border-[var(--color-brand-500)]"
                                            : "border-transparent"
                                    } ${
                                        !notification.is_read
                                            ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20 border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)]"
                                            : ""
                                    }`}
                                >
                                    {/* Delete Button - Always visible in non-select mode */}
                                    {!isSelectMode && (
                                        <button
                                            onClick={(e) => handleDelete(e, notification.id)}
                                            disabled={deleteMutation.isPending}
                                            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                                            aria-label="Delete notification"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Notification Content */}
                                    {isSelectMode ? (
                                        <div
                                            onClick={() => toggleSelect(notification.id)}
                                            className="cursor-pointer"
                                        >
                                            {Content}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleNotificationClick(notification)}
                                            className="w-full text-left"
                                        >
                                            {Content}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && !isError && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-[var(--color-text-secondary)] px-4">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}