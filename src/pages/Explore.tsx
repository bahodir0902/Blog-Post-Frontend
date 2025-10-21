import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PostsGrid from "../components/posts/PostsGrid";
import PostsList from "../components/posts/PostsList";
import ViewToggle from "../components/ui/ViewToggle";
import PageSelector from "../components/ui/PageSelector";
import Dropdown from "../components/ui/Dropdown";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { listCategories, listCategoryPosts, type Category } from "../services/categories";

type ViewMode = "grid" | "list";

export default function Explore() {
    const { data: categories, isLoading: catLoading, isError: catError } = useQuery({
        queryKey: ["categories"],
        queryFn: listCategories,
        staleTime: 5 * 60 * 1000,
    });

    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const {
        data: catPosts,
        isFetching: postsLoading,
        isError: postsError,
    } = useQuery({
        queryKey: ["category-posts", activeCategory?.id, page],
        queryFn: () => listCategoryPosts(activeCategory!.id, { page }),
        enabled: !!activeCategory,
        keepPreviousData: true,
    });

    useEffect(() => {
        if (categories && categories.length && !activeCategory) {
            setActiveCategory(categories[0]);
            setPage(1);
        }
    }, [categories, activeCategory]);

    const categoryOptions = useMemo(
        () => (categories || []).map((c) => ({ label: c.name, value: String(c.id) })),
        [categories]
    );

    const totalPages = catPosts ? Math.ceil(catPosts.count / 50) : 1;

    const handleCategorySelect = (category: Category) => {
        setActiveCategory(category);
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Explore</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Browse topics and dive into curated posts by category.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dropdown
                        className="w-52"
                        label="Quick switch"
                        options={categoryOptions}
                        value={activeCategory ? String(activeCategory.id) : undefined}
                        onChange={(v) => {
                            const picked = categories?.find((c) => String(c.id) === v) || null;
                            handleCategorySelect(picked!);
                        }}
                        placeholder="Choose category"
                    />
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
            </div>

            {/* Categories list */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Layers className="w-5 h-5 text-[var(--color-brand-500)]" />
                    <h2 className="text-2xl font-semibold">All Categories</h2>
                    {categories && (
                        <span className="text-sm text-[var(--color-text-tertiary)] ml-2">
                            ({categories.length})
                        </span>
                    )}
                </div>

                <Card className="p-6">
                    <div className="flex flex-wrap gap-3">
                        {catLoading && Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-11 w-32 skeleton rounded-xl" />
                        ))}

                        {catError && (
                            <p className="text-red-500 text-sm">Failed to load categories.</p>
                        )}

                        {categories?.map((c) => {
                            const active = c.id === activeCategory?.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => handleCategorySelect(c)}
                                    className={`
                                        px-5 py-2.5 rounded-xl border-2 font-medium text-sm
                                        transition-all duration-200
                                        ${active
                                        ? "bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)] shadow-lg scale-105"
                                        : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-500)] hover:shadow-md"
                                    }
                                    `}
                                >
                                    {c.name}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </section>

            {/* Posts in active category */}
            <section className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold mb-1">
                            {activeCategory ? activeCategory.name : "Category"}
                        </h2>
                        {catPosts && (
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                                {catPosts.count} {catPosts.count === 1 ? 'article' : 'articles'} in this category
                            </p>
                        )}
                    </div>
                </div>

                {/* Loading / error / content */}
                {postsLoading && (
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

                {postsError && (
                    <Card className="p-12 text-center">
                        <p className="text-red-500">Couldn't load posts. Please try again.</p>
                    </Card>
                )}

                {catPosts && !postsLoading && (
                    viewMode === "grid"
                        ? <PostsGrid posts={catPosts.results} />
                        : <PostsList posts={catPosts.results} />
                )}

                {/* Pagination */}
                {catPosts && (
                    <Card className="p-4">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <span className="text-sm text-[var(--color-text-tertiary)]">
                                Showing {catPosts.results.length > 0 ? ((page - 1) * 50 + 1) : 0}
                                {" - "}
                                {Math.min(page * 50, catPosts.count)} of {catPosts.count} articles
                            </span>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={!catPosts.previous || postsLoading}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
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
                                    disabled={!catPosts.next || postsLoading}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </section>
        </div>
    );
}