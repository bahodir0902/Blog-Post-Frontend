// src/pages/Read.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Dropdown from "../components/ui/Dropdown";
import PostsGrid from "../components/posts/PostsGrid";
import PostsList from "../components/posts/PostsList";
import ViewToggle from "../components/ui/ViewToggle";
import PageSelector from "../components/ui/PageSelector";
import { listClientPostsPaginated } from "../services/posts";
import { listCategories } from "../services/categories";
import { Search, ChevronLeft, ChevronRight, X, Tag as TagIcon } from "lucide-react";
import { useDebounce } from "../hooks/UseDebounce";

type ViewMode = "grid" | "list";

/**
 * Read page with comprehensive filtering:
 * - URL-based search query (?q=...)
 * - URL-based tag filtering (?tags=python,django)
 * - Category filtering
 * - Sorting options
 * - Pagination
 *
 * All filters sync with URL parameters for shareable links and browser back/forward
 */
export default function Read() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const SORT_OPTIONS = [
        { label: t('read.sortOptions.newest'), value: "-published_at" },
        { label: t('read.sortOptions.oldest'), value: "published_at" },
        { label: t('read.sortOptions.recentlyCreated'), value: "-created_at" },
        { label: t('read.sortOptions.leastRecent'), value: "created_at" },
    ];

    // Read state from URL params on mount
    const urlQuery = searchParams.get("q") || "";
    const urlTags = searchParams.get("tags") || "";
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    const urlOrdering = searchParams.get("ordering") || SORT_OPTIONS[0].value;
    const urlCategory = searchParams.get("category") || "";

    // Local state (initialized from URL)
    const [page, setPage] = useState(urlPage);
    const [ordering, setOrdering] = useState<string>(urlOrdering);
    const [searchInput, setSearchInput] = useState(urlQuery);
    const [categoryName, setCategoryName] = useState<string | undefined>(urlCategory || undefined);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    // Debounce search input to avoid spamming API
    const debouncedSearch = useDebounce(searchInput, 500);

    // Sync URL params with state on mount and when URL changes externally
    useEffect(() => {
        const newQuery = searchParams.get("q") || "";
        const newTags = searchParams.get("tags") || "";
        const newPage = parseInt(searchParams.get("page") || "1", 10);
        const newOrdering = searchParams.get("ordering") || SORT_OPTIONS[0].value;
        const newCategory = searchParams.get("category") || "";

        setSearchInput(newQuery);
        setPage(newPage);
        setOrdering(newOrdering);
        setCategoryName(newCategory || undefined);
    }, [searchParams]);

    // Update URL whenever filters change
    useEffect(() => {
        const params: Record<string, string> = {};

        if (debouncedSearch) params.q = debouncedSearch;
        if (urlTags) params.tags = urlTags;
        if (page > 1) params.page = page.toString();
        if (ordering !== SORT_OPTIONS[0].value) params.ordering = ordering;
        if (categoryName) params.category = categoryName;

        setSearchParams(params, { replace: true });
    }, [debouncedSearch, urlTags, page, ordering, categoryName, setSearchParams]);

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ["categories-lite"],
        queryFn: listCategories,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch posts with all active filters
    const { data, isFetching, error } = useQuery({
        queryKey: ["all-posts", page, ordering, debouncedSearch, categoryName, urlTags],
        queryFn: () => listClientPostsPaginated({
            page,
            ordering,
            q: debouncedSearch || undefined,
            categoryName,
            tags: urlTags || undefined,
        }),
        keepPreviousData: true,
    });

    const categoryOptions = useMemo(
        () => [
            { label: t('explore.allCategories'), value: "" },
            ...(categories || []).map((c) => ({ label: c.name, value: c.name }))
        ],
        [categories, t]
    );

    const totalPages = data ? Math.ceil(data.count / 50) : 1;

    // Get active tag filters as array
    const activeTagFilters = useMemo(() => {
        if (!urlTags) return [];
        return urlTags.split(",").map(t => t.trim()).filter(Boolean);
    }, [urlTags]);

    // Event handlers
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        setPage(1); // Reset to first page on search
    };

    const handleOrderingChange = (value: string) => {
        setOrdering(value);
        setPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setCategoryName(value || undefined);
        setPage(1);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const remainingTags = activeTagFilters.filter(t => t !== tagToRemove);
        const params = new URLSearchParams(searchParams);

        if (remainingTags.length > 0) {
            params.set("tags", remainingTags.join(","));
        } else {
            params.delete("tags");
        }

        setSearchParams(params);
        setPage(1);
    };

    const handleClearAllFilters = () => {
        setSearchInput("");
        setOrdering(SORT_OPTIONS[0].value);
        setCategoryName(undefined);
        setSearchParams({});
        setPage(1);
    };

    // Check if any filters are active
    const hasActiveFilters = searchInput || urlTags || categoryName || ordering !== SORT_OPTIONS[0].value;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{t('read.title')}</h1>
                        <p className="text-[var(--color-text-secondary)]">
                            {data?.count ? (
                                <>{t('read.browseCount', { count: data.count })}</>
                            ) : (
                                t('read.loadingArticles')
                            )}
                        </p>
                    </div>
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
            </header>

            {/* Active Filters Display */}
            {(activeTagFilters.length > 0 || searchInput || categoryName) && (
                <Card className="p-4 animate-scale-in">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {t('read.activeFilters')}:
                        </span>

                        {/* Search Query Badge */}
                        {searchInput && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)] text-sm font-medium border border-[var(--color-brand-200)] dark:border-[var(--color-brand-700)]">
                                <Search className="w-3.5 h-3.5" />
                                <span>"{searchInput}"</span>
                            </div>
                        )}

                        {/* Category Badge */}
                        {categoryName && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-sm font-medium border border-[var(--color-border)]">
                                <span>Category: {categoryName}</span>
                                <button
                                    onClick={() => handleCategoryChange("")}
                                    className="hover:text-[var(--color-error)] transition-colors"
                                    aria-label="Remove category filter"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Tag Badges */}
                        {activeTagFilters.map((tag) => (
                            <div
                                key={tag}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] dark:text-blue-400 text-sm font-medium border border-[var(--color-accent-blue)]/30"
                            >
                                <TagIcon className="w-3.5 h-3.5" />
                                <span>{tag}</span>
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-[var(--color-error)] transition-colors"
                                    aria-label={`Remove ${tag} filter`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        {/* Clear All Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearAllFilters}
                                className="ml-auto text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors underline"
                            >
                                {t('read.clearAllFilters')}
                            </button>
                        )}
                    </div>
                </Card>
            )}

            {/* Controls */}
            <Card className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                            {t('common.search')}
                        </label>
                        <Input
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder={t('read.searchPlaceholder')}
                            icon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Dropdown
                            label={t('explore.sortBy')}
                            options={SORT_OPTIONS}
                            value={ordering}
                            onChange={handleOrderingChange}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Dropdown
                            label={t('explore.categories')}
                            options={categoryOptions}
                            value={categoryName ?? ""}
                            onChange={handleCategoryChange}
                            placeholder={t('explore.allCategories')}
                        />
                    </div>
                </div>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="p-8 text-center">
                    <div className="text-red-500 mb-2">
                        <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                        {t('read.failedToLoad')}
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                        {t('read.errorLoadingArticles')}
                    </p>
                </Card>
            )}

            {/* Loading State */}
            {isFetching && (
                <div className={viewMode === "grid"
                    ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            {viewMode === "grid" ? (
                                <>
                                    <div className="aspect-[16/10] skeleton" />
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 w-3/4 skeleton rounded" />
                                        <div className="h-4 w-full skeleton rounded" />
                                        <div className="h-4 w-5/6 skeleton rounded" />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-64 h-48 skeleton" />
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="h-6 w-3/4 skeleton rounded" />
                                        <div className="h-4 w-full skeleton rounded" />
                                        <div className="h-4 w-5/6 skeleton rounded" />
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* No Results State */}
            {data && !isFetching && data.results.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="text-[var(--color-text-tertiary)] mb-3">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                        {t('read.noArticlesFound')}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        {hasActiveFilters
                            ? t('read.noMatchingArticles')
                            : t('read.noArticlesAvailable')
                        }
                    </p>
                    {hasActiveFilters && (
                        <Button
                            variant="secondary"
                            onClick={handleClearAllFilters}
                        >
                            {t('read.clearAllFilters')}
                        </Button>
                    )}
                </Card>
            )}

            {/* Content */}
            {data && !isFetching && data.results.length > 0 && (
                viewMode === "grid"
                    ? <PostsGrid posts={data.results} />
                    : <PostsList posts={data.results} />
            )}

            {/* Pagination */}
            {data && data.results.length > 0 && (
                <Card className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="text-sm text-[var(--color-text-tertiary)]">
                            {t('read.showingRange', {
                                from: data.results.length > 0 ? ((page - 1) * 50 + 1) : 0,
                                to: Math.min(page * 50, data.count),
                                total: data.count
                            })}
                        </span>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={!data.previous || isFetching}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t('common.previous')}
                            </Button>

                            {totalPages > 1 && (
                                <PageSelector
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            )}

                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={!data.next || isFetching}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                {t('common.next')}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}