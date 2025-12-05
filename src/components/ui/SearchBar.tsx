// src/components/ui/SearchBar.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

interface SearchBarProps {
    /** Optional: initial query value */
    initialQuery?: string;
    /** Mobile mode changes layout behavior */
    mobile?: boolean;
}

/**
 * Expandable search bar with smooth animations.
 * - Collapsed: shows only search icon
 * - Expanded: shows full input field
 * - Submits search query to /read page with ?q= parameter
 * - Auto-collapses on blur (unless there's a value)
 */
export default function SearchBar({ initialQuery = "", mobile = false }: SearchBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Focus input when expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Only collapse if there's no query
                if (!query.trim()) {
                    setIsExpanded(false);
                }
            }
        };

        if (isExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isExpanded, query]);

    const handleExpand = () => {
        setIsExpanded(true);
    };

    const handleCollapse = () => {
        if (!query.trim()) {
            setIsExpanded(false);
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmedQuery = query.trim();

        if (trimmedQuery) {
            // Navigate to read page with search query
            navigate(`/read?q=${encodeURIComponent(trimmedQuery)}`);

            // On mobile, collapse after search
            if (mobile) {
                setIsExpanded(false);
                inputRef.current?.blur();
            }
        }
    };

    const handleClear = () => {
        setQuery("");
        setIsExpanded(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "Escape") {
            handleClear();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`
                relative flex items-center transition-all duration-300 ease-in-out
                ${mobile ? "w-full" : ""}
            `}
        >
            <form
                onSubmit={handleSubmit}
                className={`
                    flex items-center gap-2 transition-all duration-300 ease-in-out
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    rounded-lg overflow-hidden
                    hover:border-[var(--color-border-strong)]
                    focus-within:border-[var(--color-brand-500)]
                    focus-within:ring-2 focus-within:ring-[var(--color-brand-500)] focus-within:ring-opacity-20
                    ${isExpanded ? (mobile ? "w-full" : "w-64 lg:w-80") : "w-10"}
                    ${mobile ? "w-full" : ""}
                `}
            >
                {/* Search Icon Button */}
                <button
                    type={isExpanded ? "submit" : "button"}
                    onClick={isExpanded ? undefined : handleExpand}
                    className="p-2 flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] transition-colors"
                    aria-label={isExpanded ? "Submit search" : "Open search"}
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={handleCollapse}
                    onKeyDown={handleKeyDown}
                    placeholder="Search articles..."
                    className={`
                        flex-1 bg-transparent border-none outline-none
                        text-sm text-[var(--color-text-primary)]
                        placeholder-[var(--color-text-tertiary)]
                        transition-all duration-300 ease-in-out
                        ${isExpanded ? "w-full opacity-100 pr-2" : "w-0 opacity-0"}
                    `}
                />

                {/* Clear Button */}
                {isExpanded && query && (
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault(); // Prevent blur
                            handleClear();
                        }}
                        className="p-2 flex-shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors animate-scale-in"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </form>
        </div>
    );
}