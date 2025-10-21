import { Grid3x3, List } from "lucide-react";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="inline-flex items-center gap-1 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <button
                type="button"
                onClick={() => onViewChange("grid")}
                className={`
                    p-2 rounded-lg transition-all duration-200
                    ${view === "grid"
                    ? "bg-[var(--color-brand-500)] text-white shadow-md"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                }
                `}
                aria-label="Grid view"
            >
                <Grid3x3 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => onViewChange("list")}
                className={`
                    p-2 rounded-lg transition-all duration-200
                    ${view === "list"
                    ? "bg-[var(--color-brand-500)] text-white shadow-md"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                }
                `}
                aria-label="List view"
            >
                <List className="w-4 h-4" />
            </button>
        </div>
    );
}