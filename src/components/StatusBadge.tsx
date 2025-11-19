// src/components/StatusBadge.tsx
import React from "react";
import clsx from "clsx";
import {Clock, CheckCircle2, Archive, FileText} from "lucide-react";
import {useTheme} from "./ThemeProvider";

type StatusBadgeProps = {
    status?: string;
    publishedAt?: string | null;
    compact?: boolean;
};

export default function StatusBadge({status, publishedAt, compact = false}: StatusBadgeProps) {
    if (!status) return null;

    const {actualTheme} = useTheme();

    const formatPublishTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `in ${diffMins}m`;
        if (diffHours < 24) return `in ${diffHours}h`;
        if (diffDays < 7) return `in ${diffDays}d`;

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusConfig: Record<string, {
        colors: { light: string; dark: string };
        icon: React.ReactNode;
        label: string;
    }> = {
        draft: {
            colors: {
                light: "bg-slate-100 text-slate-700 border-slate-200",
                dark: "dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/50"
            },
            icon: <FileText className="h-3 w-3 text-current" />,
            label: "Draft"
        },
        published: {
            colors: {
                light: "bg-emerald-100 text-emerald-700 border-emerald-200",
                dark: "dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50"
            },
            icon: <CheckCircle2 className="h-3 w-3 text-current" />,
            label: "Published"
        },
        scheduled: {
            colors: {
                light: "bg-amber-100 text-amber-700 border-amber-200",
                dark: "dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800/50"
            },
            icon: <Clock className="h-3 w-3 text-current" />,
            label: "Scheduled"
        },
        archived: {
            colors: {
                light: "bg-gray-100 text-gray-700 border-gray-200",
                dark: "dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700/50"
            },
            icon: <Archive className="h-3 w-3 text-current" />,
            label: "Archived"
        },
    };

    const cfg = statusConfig[status] ?? statusConfig.draft;
    const chosenColors = actualTheme === "dark" ? cfg.colors.dark : cfg.colors.light;
    const showScheduleTime = status === "scheduled" && publishedAt;

    return (
        <div className="inline-flex items-center gap-1.5">
            <span
                className={clsx(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold border uppercase tracking-wide whitespace-nowrap",
                    chosenColors
                )}
            >
                {cfg.icon}
                <span>{cfg.label}</span>
            </span>
            {showScheduleTime && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-500 whitespace-nowrap">
                    <Clock className="h-2.5 w-2.5" />
                    {formatPublishTime(publishedAt)}
                </span>
            )}
        </div>
    );
}