import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "../hooks/UseDebounce";

const SORT_OPTIONS = [
    { label: "Newest", value: "-published_at" },
    { label: "Oldest", value: "published_at" },
    { label: "Recently created", value: "-created_at" },
    { label: "Least recent", value: "created_at" },
];

type ViewMode = "grid" | "list";

export default function Read() {
    const [page, setPage] = useState(1);
    const [ordering, setOrdering] = useState<string>(SORT_OPTIONS[0].value);
    const [search, setSearch] = useState("");
    const [categoryName, setCategoryName] = useState<string | undefined>(undefined);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    // Debounce search input to avoid spamming requests
    const debouncedSearch = useDebounce(search, 500);

    const { data: categories } = useQuery({
        queryKey: ["categories-lite"],
        queryFn: listCategories,
        staleTime: 5 * 60 * 1000,
    });

    const { data, isFetching } = useQuery({
        queryKey: ["all-posts", page, ordering, debouncedSearch, categoryName],
        queryFn: () => listClientPostsPaginated({
            page,
            ordering,
            search: debouncedSearch || undefined,
            categoryName
        }),
        keepPreviousData: true,
    });

    const categoryOptions = useMemo(
        () => [
            { label: "All categories", value: "" },
            ...(categories || []).map((c) => ({ label: c.name, value: c.name }))
        ],
        [categories]
    );

    const totalPages = data ? Math.ceil(data.count / 50) : 1;

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleOrderingChange = (value: string) => {
        setOrdering(value);
        setPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setCategoryName(value || undefined);
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header className="space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">All Articles</h1>
                        <p className="text-[var(--color-text-secondary)]">
                            Browse {data?.count || 0} articles. Use search, filters, and sorting to find your next read.
                        </p>
                    </div>
                    <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
            </header>

            {/* Controls */}
            <Card className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label className="block mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                            Search
                        </label>
                        <Input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search title or description..."
                            icon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Dropdown
                            label="Sort by"
                            options={SORT_OPTIONS}
                            value={ordering}
                            onChange={handleOrderingChange}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <Dropdown
                            label="Category"
                            options={categoryOptions}
                            value={categoryName ?? ""}
                            onChange={handleCategoryChange}
                            placeholder="All categories"
                        />
                    </div>
                </div>
            </Card>

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

            {/* Content */}
            {data && !isFetching && (
                viewMode === "grid"
                    ? <PostsGrid posts={data.results} />
                    : <PostsList posts={data.results} />
            )}

            {/* Pagination */}
            {data && (
                <Card className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="text-sm text-[var(--color-text-tertiary)]">
                            Showing {data.results.length > 0 ? ((page - 1) * 50 + 1) : 0}
                            {" - "}
                            {Math.min(page * 50, data.count)} of {data.count} articles
                        </span>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={!data.previous || isFetching}
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
                                disabled={!data.next || isFetching}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}