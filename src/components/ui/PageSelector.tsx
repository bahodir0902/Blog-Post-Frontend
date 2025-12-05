// src/components/ui/PageSelector.tsx
import { useMemo } from "react";

interface PageSelectorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
}

/**
 * Smart pagination component that shows relevant page numbers
 * with ellipsis for large page counts
 */
export default function PageSelector({
                                         currentPage,
                                         totalPages,
                                         onPageChange,
                                         maxVisible = 5,
                                     }: PageSelectorProps) {
    // Calculate which page numbers to show
    const pageNumbers = useMemo(() => {
        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | string)[] = [];
        const halfVisible = Math.floor(maxVisible / 2);

        // Always show first page
        pages.push(1);

        let start = Math.max(2, currentPage - halfVisible);
        let end = Math.min(totalPages - 1, currentPage + halfVisible);

        // Adjust if we're near the beginning
        if (currentPage <= halfVisible + 1) {
            end = maxVisible - 1;
        }

        // Adjust if we're near the end
        if (currentPage >= totalPages - halfVisible) {
            start = totalPages - maxVisible + 2;
        }

        // Add ellipsis after first page if needed
        if (start > 2) {
            pages.push("...");
        }

        // Add middle pages
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if needed
        if (end < totalPages - 1) {
            pages.push("...");
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages, maxVisible]);

    return (
        <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => {
                if (page === "...") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-[var(--color-text-tertiary)]"
                        >
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        disabled={isActive}
                        className={`
                            min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${isActive
                            ? "bg-[var(--color-brand-600)] text-white shadow-sm cursor-default"
                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                        }
                        `}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {pageNum}
                    </button>
                );
            })}
        </div>
    );
}