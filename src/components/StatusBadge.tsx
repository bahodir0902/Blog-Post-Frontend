// src/components/StatusBadge.tsx
import React from "react";
import clsx from "clsx";

export default function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;
    const map: Record<string, string> = {
        draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
        published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        archived: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
    const label = status[0].toUpperCase() + status.slice(1);
    return (
        <span
            className={clsx(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                map[status] ?? map.draft
            )}
        >
      {label}
    </span>
    );
}
