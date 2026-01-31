// src/pages/Explore.tsx - Premium Redesign
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card";
import PostsGrid from "../components/posts/PostsGrid";
import PostsList from "../components/posts/PostsList";
import ViewToggle from "../components/ui/ViewToggle";
import PageSelector from "../components/ui/PageSelector";
import { 
    ChevronLeft, 
    ChevronRight, 
    Layers, 
    Search, 
    Sparkles, 
    X,
    BookOpen
} from "lucide-react";
import { listCategories, listCategoryPosts, type Category } from "../services/categories";
import type { PostListItem } from "../types/user";

interface Paginated<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

type ViewMode = "grid" | "list";

export default function Explore() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearch = searchParams.get("q") || "";

    const { data: categories, isLoading: catLoading, isError: catError } = useQuery({
        queryKey: ["categories"],
        queryFn: listCategories,
        staleTime: 5 * 60 * 1000,
    });

    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    const {
        data: catPosts,
        isFetching: postsLoading,
        isError: postsError,
    } = useQuery<Paginated<PostListItem>>({
        queryKey: ["category-posts", activeCategory?.id, page],
        queryFn: () => listCategoryPosts(activeCategory!.id, { page }),
        enabled: !!activeCategory,
    });

    useEffect(() => {
        if (categories && categories.length && !activeCategory) {
            setActiveCategory(categories[0]);
            setPage(1);
        }
    }, [categories, activeCategory]);

    // Filter posts by search query
    const filteredPosts = useMemo(() => {
        if (!catPosts?.results) return [];
        if (!searchQuery.trim()) return catPosts.results;
        const query = searchQuery.toLowerCase();
        return catPosts.results.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.short_description?.toLowerCase().includes(query)
        );
    }, [catPosts?.results, searchQuery]);

    const totalPages = catPosts ? Math.ceil(catPosts.count / 50) : 1;

    const handleCategorySelect = (category: Category) => {
        setActiveCategory(category);
        setPage(1);
        setSearchQuery("");
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (value) {
            setSearchParams({ q: value });
        } else {
            setSearchParams({});
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSearchParams({});
        if (categories?.length) {
            setActiveCategory(categories[0]);
        }
        setPage(1);
    };

    return (
        <div className="space-y-10 md:space-y-14">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[var(--color-brand-100)]/30 to-transparent dark:from-[var(--color-brand-100)]/10 rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-[var(--color-accent-gold)]/10 to-transparent rounded-full blur-2xl translate-y-1/2" />
                </div>

                <div className="container-responsive relative">
                    <div className="max-w-3xl mx-auto text-center py-12 md:py-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm mb-6 animate-slide-up">
                            <Sparkles className="w-4 h-4 text-[var(--color-brand-500)]" />
                            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                                Discover by Topic
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] mb-4 animate-slide-up-delay-1">
                            Explore Our
                            <span className="block mt-1 gradient-text-brand">Content Library</span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-8 animate-slide-up-delay-2">
                            Browse curated articles across various topics and find exactly what interests you.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto animate-slide-up-delay-3">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]" />
                                <input
                                    type="text"
                                    placeholder="Search articles by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 transition-all text-base"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                                    >
                                        <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="container-responsive">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Categories Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-100)]">
                                        <Layers className="w-5 h-5 text-[var(--color-brand-600)]" />
                                    </div>
                                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Categories</h2>
                                </div>
                                {categories && (
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)]">
                                        {categories.length}
                                    </span>
                                )}
                            </div>

                            {/* Categories List */}
                            <Card className="p-3">
                                <div className="space-y-1">
                                    {catLoading && Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-11 skeleton rounded-xl" />
                                    ))}

                                    {catError && (
                                        <p className="text-[var(--color-error)] text-sm p-3">Failed to load categories.</p>
                                    )}

                                    {categories?.map((c) => {
                                        const active = c.id === activeCategory?.id;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => handleCategorySelect(c)}
                                                className={`
                                                    w-full px-4 py-3 rounded-xl font-medium text-sm text-left
                                                    transition-all duration-200 flex items-center justify-between group
                                                    ${active
                                                        ? "bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md"
                                                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                                    }
                                                `}
                                            >
                                                <span>{c.name}</span>
                                                <ChevronRight className={`
                                                    w-4 h-4 transition-transform
                                                    ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                                                `} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Quick Stats */}
                            {catPosts && (
                                <Card className="p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Quick Stats</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--color-text-secondary)]">Total Articles</span>
                                            <span className="font-semibold text-[var(--color-text-primary)]">{catPosts.count}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--color-text-secondary)]">Current Page</span>
                                            <span className="font-semibold text-[var(--color-text-primary)]">{page} of {totalPages}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-6">
                        {/* Content Header */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                                    {activeCategory?.name || "Select a Category"}
                                </h2>
                                {catPosts && (
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {searchQuery
                                            ? `${filteredPosts.length} results for "${searchQuery}"`
                                            : `${catPosts.count} articles in this category`
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {(searchQuery || activeCategory !== categories?.[0]) && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear Filters
                                    </button>
                                )}
                                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                            </div>
                        </div>

                        {/* Loading State */}
                        {postsLoading && (
                            <div className={viewMode === "grid"
                                ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
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

                        {/* Error State */}
                        {postsError && (
                            <Card className="p-12 text-center">
                                <div className="max-w-sm mx-auto space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-error-light)] text-[var(--color-error)]">
                                        <X className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Something went wrong</h3>
                                    <p className="text-[var(--color-text-secondary)]">Couldn't load posts. Please try again.</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md hover:shadow-lg transition-all"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </Card>
                        )}

                        {/* Empty State */}
                        {!postsLoading && filteredPosts.length === 0 && catPosts && (
                            <Card className="p-16 text-center">
                                <div className="max-w-sm mx-auto space-y-4">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-surface-elevated)]">
                                        <BookOpen className="w-10 h-10 text-[var(--color-text-tertiary)]" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">No articles found</h3>
                                    <p className="text-[var(--color-text-secondary)]">
                                        {searchQuery 
                                            ? "Try adjusting your search query or exploring other categories."
                                            : "No articles in this category yet. Check back soon!"
                                        }
                                    </p>
                                    {searchQuery && (
                                        <button
                                            onClick={() => handleSearch("")}
                                            className="px-6 py-3 rounded-xl font-semibold border-2 border-[var(--color-border)] hover:border-[var(--color-brand-400)] text-[var(--color-text-primary)] transition-all"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Posts Grid/List */}
                        {catPosts && !postsLoading && filteredPosts.length > 0 && (
                            viewMode === "grid"
                                ? <PostsGrid posts={filteredPosts} />
                                : <PostsList posts={filteredPosts} />
                        )}

                        {/* Pagination */}
                        {catPosts && filteredPosts.length > 0 && !searchQuery && (
                            <Card className="p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span className="text-sm text-[var(--color-text-secondary)]">
                                        Showing <span className="font-semibold text-[var(--color-text-primary)]">
                                            {catPosts.results.length > 0 ? ((page - 1) * 50 + 1) : 0}
                                            {" - "}
                                            {Math.min(page * 50, catPosts.count)}
                                        </span> of <span className="font-semibold text-[var(--color-text-primary)]">{catPosts.count}</span> articles
                                    </span>

                                    <div className="flex items-center gap-3">
                                        <button
                                            disabled={!catPosts.previous || postsLoading}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className="px-4 py-2.5 rounded-xl font-medium text-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-400)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>

                                        {totalPages > 1 && (
                                            <PageSelector
                                                currentPage={page}
                                                totalPages={totalPages}
                                                onPageChange={setPage}
                                            />
                                        )}

                                        <button
                                            disabled={!catPosts.next || postsLoading}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="px-4 py-2.5 rounded-xl font-medium text-sm border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-400)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
