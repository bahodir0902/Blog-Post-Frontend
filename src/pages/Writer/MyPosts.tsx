// src/pages/Writer/MyPosts.tsx
import React, {useMemo, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useSearchParams, useNavigate} from "react-router-dom";
import {getMyPosts, deleteAuthorPost} from "../../services/authorPosts";
import {Trash2, Pencil, ExternalLink, Plus, Image as ImageIcon, Calendar} from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";

export default function MyPosts() {
    const [params, setParams] = useSearchParams();
    const page = Number(params.get("page") || "1");
    const navigate = useNavigate();
    const qc = useQueryClient();

    const q = useQuery({
        queryKey: ["author", "my-posts", page],
        queryFn: () => getMyPosts(page),
        keepPreviousData: true,
    });

    const items = q.data?.results ?? [];
    const total = q.data?.count ?? items.length;
    const pageSize = items.length ? items.length : 10;

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
                <div className="mb-4 sm:mb-6 lg:mb-8 animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent mb-1 sm:mb-2">
                                My Posts
                            </h1>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                                Manage your content • Drafts are private
                            </p>
                        </div>
                        <Link
                            to="/writer/new"
                            className="self-start sm:self-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] text-white rounded-lg sm:rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-200 focus-ring"
                        >
                            <Plus className="h-4 w-4" />
                            <span>New Post</span>
                        </Link>
                    </div>

                    {/* Stats */}
                    {!empty && !q.isLoading && (
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] animate-fade-in">
                            <span className="font-semibold text-[var(--color-text-primary)]">{total}</span>
                            <span>{total === 1 ? 'post' : 'posts'}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--color-border-strong)]"></span>
                            <span>Page {page}</span>
                        </div>
                    )}
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
                                                <div className="flex items-center gap-1 hidden sm:flex">
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