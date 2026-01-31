// src/pages/Writer/MyPosts.tsx
import React, {useMemo, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useSearchParams, useNavigate} from "react-router-dom";
import {getMyPosts, deleteAuthorPost} from "../../services/authorPosts";
import {Trash2, Pencil, ExternalLink, Plus, Image as ImageIcon, Calendar, FileText, Eye, Clock, Send} from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";

type StatusFilter = "all" | "published" | "draft" | "scheduled";

const STATUS_TABS: { key: StatusFilter; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "All Posts", icon: FileText },
    { key: "published", label: "Published", icon: Eye },
    { key: "draft", label: "Drafts", icon: Pencil },
    { key: "scheduled", label: "Scheduled", icon: Clock },
];

export default function MyPosts() {
    const [params, setParams] = useSearchParams();
    const page = Number(params.get("page") || "1");
    const statusFilter = (params.get("status") || "all") as StatusFilter;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const q = useQuery({
        queryKey: ["author", "my-posts", page],
        queryFn: () => getMyPosts(page),
        keepPreviousData: true,
    });

    // Filter items based on status
    const allItems = q.data?.results ?? [];
    const items = useMemo(() => {
        if (statusFilter === "all") return allItems;
        return allItems.filter(p => {
            if (statusFilter === "published") return p.status === "published";
            if (statusFilter === "draft") return p.status === "draft";
            if (statusFilter === "scheduled") return p.status === "scheduled";
            return true;
        });
    }, [allItems, statusFilter]);

    // Count by status for badges
    const statusCounts = useMemo(() => {
        return {
            all: allItems.length,
            published: allItems.filter(p => p.status === "published").length,
            draft: allItems.filter(p => p.status === "draft").length,
            scheduled: allItems.filter(p => p.status === "scheduled").length,
        };
    }, [allItems]);

    const total = q.data?.count ?? items.length;
    const pageSize = allItems.length ? allItems.length : 10;

    const hasNext = Boolean(q.data?.next);
    const hasPrev = Boolean(q.data?.previous) || page > 1;

    const [toDelete, setToDelete] = useState<{ slug: string; title: string } | null>(null);

    const del = useMutation({
        mutationFn: (slug: string) => deleteAuthorPost(slug),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ["author", "my-posts"]});
        },
    });

    const onConfirmDelete = async () => {
        if (!toDelete) return;
        await del.mutateAsync(toDelete.slug);
        setToDelete(null);
    };

    const empty = useMemo(() => !q.isLoading && items.length === 0, [q.isLoading, items.length]);

    const handleStatusChange = (status: StatusFilter) => {
        const newParams = new URLSearchParams(params);
        newParams.set("status", status);
        newParams.set("page", "1");
        setParams(newParams);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <div className="container-responsive max-w-7xl py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mb-1 sm:mb-2">
                                My Posts
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                                Manage your content • Drafts are private
                            </p>
                        </div>
                        <Link
                            to="/writer/new"
                            className="self-start sm:self-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-[var(--color-brand-500)]/25 hover:-translate-y-0.5 transition-all duration-200 focus-ring"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Post</span>
                        </Link>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-x-auto">
                        {STATUS_TABS.map(({ key, label, icon: Icon }) => {
                            const isActive = statusFilter === key;
                            const count = statusCounts[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                                        ${isActive 
                                            ? 'bg-[var(--color-brand-500)] text-white shadow-md' 
                                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]'
                                        }
                                    `}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{label}</span>
                                    {count > 0 && (
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${isActive 
                                                ? 'bg-white/20 text-white' 
                                                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)]'
                                            }
                                        `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading */}
                {q.isLoading && (
                    <div className="space-y-2 sm:space-y-3 animate-fade-in">
                        {Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="card p-4 sm:p-5 lg:p-6">
                                <div className="flex gap-3 sm:gap-4 lg:gap-8">
                                    <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-48 lg:h-48 skeleton rounded-lg flex-shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 lg:space-y-5">
                                        <div className="h-5 sm:h-6 lg:h-8 w-3/4 skeleton rounded" />
                                        <div className="h-3 sm:h-4 lg:h-5 w-full skeleton rounded" />
                                        <div className="h-3 sm:h-4 lg:h-5 w-5/6 skeleton rounded" />
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-20 skeleton rounded-full" />
                                            <div className="h-4 w-32 skeleton rounded" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {empty && (
                    <div className="card p-8 sm:p-12 text-center animate-scale-in">
                        <div className="max-w-sm mx-auto space-y-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-[var(--color-brand-500)]/10 to-[var(--color-accent-500)]/10 rounded-2xl flex items-center justify-center">
                                <Pencil className="h-7 w-7 sm:h-8 sm:w-8 text-[var(--color-brand-600)]" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1">
                                    No posts yet
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Create your first post to get started
                                </p>
                            </div>
                            <Link
                                to="/writer/new"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-brand-600)] text-white rounded-lg font-semibold hover:bg-[var(--color-brand-700)] transition-all duration-200 hover:shadow-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Create First Post
                            </Link>
                        </div>
                    </div>
                )}

                {/* Posts Grid */}
                {!q.isLoading && !empty && (
                    <div className="space-y-2 sm:space-y-3 animate-fade-in">
                        {items.map((p) => (
                            <article
                                key={p.id}
                                className="card group overflow-hidden"
                            >
                                <div className="flex gap-3 sm:gap-4 lg:gap-8 p-4 sm:p-5 lg:p-6">
                                    {/* Thumbnail */}
                                    <Link
                                        to={`/post/${p.slug}`}
                                        className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-48 lg:h-48 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-elevated)] group-hover:shadow-md transition-all duration-300"
                                    >
                                        {p.cover_image ? (
                                            <img
                                                src={p.cover_image}
                                                alt={p.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`${p.cover_image ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-[var(--color-brand-500)]/5 to-[var(--color-accent-500)]/5`}>
                                            <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-[var(--color-text-tertiary)]" />
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        {/* Title & Status */}
                                        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                                            <Link
                                                to={`/post/${p.slug}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors line-clamp-2 leading-tight">
                                                    {p.title}
                                                </h3>
                                            </Link>
                                            <div className="flex-shrink-0">
                                                <StatusBadge
                                                    status={p.status}
                                                    publishedAt={p.published_at}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm sm:text-base text-[var(--color-text-secondary)] line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                                            {p.short_description}
                                        </p>

                                        {/* Meta & Actions */}
                                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                            {/* Dates */}
                                            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[var(--color-text-tertiary)]">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="font-medium">Updated</span>
                                                    <span>{formatDateTime(p.updated_at)}</span>
                                                </div>
                                                <div className="hidden sm:flex items-center gap-1">
                                                    <span>•</span>
                                                    <span className="font-medium">Created</span>
                                                    <span>{formatDateTime(p.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                                <Link
                                                    to={`/post/${p.slug}`}
                                                    className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] transition-all inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm lg:text-base font-medium focus-ring"
                                                    title="View post"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">View</span>
                                                </Link>
                                                <button
                                                    onClick={() => navigate(`/writer/edit/${p.slug}`)}
                                                    className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-700)] dark:hover:bg-[var(--color-brand-900)] transition-all inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm lg:text-base font-medium focus-ring"
                                                    title="Edit post"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => setToDelete({ slug: p.slug, title: p.title })}
                                                    className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5 rounded-md border border-[var(--color-error)]/20 bg-[var(--color-surface)] hover:bg-red-50 hover:border-[var(--color-error)] text-[var(--color-error)] dark:hover:bg-red-950/30 transition-all inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm lg:text-base font-medium focus-ring"
                                                    title="Delete post"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {total > pageSize && (
                    <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 animate-fade-in">
                        <div className="text-xs text-[var(--color-text-secondary)]">
                            Page <span className="font-semibold text-[var(--color-text-primary)]">{page}</span>
                            {total > 0 && (
                                <span> of ~<span className="font-semibold text-[var(--color-text-primary)]">{Math.ceil(total / pageSize)}</span></span>
                            )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                disabled={!hasPrev || q.isFetching}
                                onClick={() => setParams({page: String(Math.max(1, page - 1))})}
                                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium focus-ring text-sm"
                            >
                                Previous
                            </button>
                            <button
                                disabled={!hasNext || q.isFetching}
                                onClick={() => setParams({page: String(page + 1)})}
                                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium focus-ring text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!toDelete}
                title="Delete this post?"
                description={
                    toDelete
                        ? `"${toDelete.title}" will be permanently removed. This action cannot be undone.`
                        : undefined
                }
                confirmText={del.isPending ? "Deleting…" : "Delete"}
                danger
                onConfirm={onConfirmDelete}
                onClose={() => setToDelete(null)}
            />
        </div>
    );
}