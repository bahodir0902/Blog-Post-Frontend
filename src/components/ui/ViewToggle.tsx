// src/components/ui/ViewToggle.tsx
import { Grid, List } from "lucide-react";

interface ViewToggleProps {
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
}

/**
 * Toggle between grid and list view modes
 */
export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="inline-flex items-center gap-1 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
            <button
                onClick={() => onViewChange("grid")}
                className={`
                    p-2 rounded-md transition-all duration-200
                    ${view === "grid"
                    ? "bg-[var(--color-brand-600)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                }
                `}
                aria-label="Grid view"
                title="Grid view"
            >
                <Grid className="w-5 h-5" />
            </button>
            <button
                onClick={() => onViewChange("list")}
                className={`
                    p-2 rounded-md transition-all duration-200
                    ${view === "list"
                    ? "bg-[var(--color-brand-600)] text-white shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                }
                `}
                aria-label="List view"
                title="List view"
            >
                <List className="w-5 h-5" />
            </button>
        </div>
    );
}