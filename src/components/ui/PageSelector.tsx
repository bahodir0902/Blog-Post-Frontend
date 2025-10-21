import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface PageSelectorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PageSelector({ currentPage, totalPages, onPageChange }: PageSelectorProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="
                    px-3 py-2 rounded-lg
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    hover:border-[var(--color-border-strong)]
                    text-sm text-[var(--color-text-primary)]
                    flex items-center gap-2
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-1
                "
            >
                <span className="font-medium">Page {currentPage}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute z-50 mt-1 right-0 rounded-xl overflow-hidden
                        bg-[var(--color-surface)] border border-[var(--color-border)]
                        shadow-xl animate-scale-in min-w-[120px]
                    "
                >
                    <ul className="py-1 max-h-64 overflow-y-auto">
                        {pages.map((page) => {
                            const active = page === currentPage;
                            return (
                                <li key={page}>
                                    <button
                                        type="button"
                                        className={`
                                            w-full text-left px-4 py-2 text-sm
                                            transition-all duration-150
                                            ${active
                                            ? "bg-[var(--color-brand-500)] text-white font-medium"
                                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                        }
                                        `}
                                        onClick={() => {
                                            onPageChange(page);
                                            setOpen(false);
                                        }}
                                    >
                                        Page {page}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}