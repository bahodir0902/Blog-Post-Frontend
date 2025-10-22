// src/pages/Writer/MyPosts.tsx
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getMyPosts, deleteAuthorPost } from "../../services/authorPosts";
import { Trash2, Pencil, ExternalLink, MoreVertical, Plus, Image as ImageIcon } from "lucide-react";
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

    // delete flow
    const [toDelete, setToDelete] = useState<{ slug: string; title: string } | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);

    const del = useMutation({
        mutationFn: (slug: string) => deleteAuthorPost(slug),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["author", "my-posts"] });
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
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <div className="container-responsive max-w-7xl py-8">
                {/* Header Section */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent">
                                My Posts
                            </h1>
                            <p className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl">
                                Manage your content. Drafts are private; published posts are visible to everyone.
                            </p>
                        </div>

                        <Link
                            to="/writer/new"
                            className="btn inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-700)] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 focus-ring whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Post</span>
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    {!empty && !q.isLoading && (
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)] animate-fade-in">
                            <span className="flex items-center gap-1.5">
                                <span className="font-semibold text-[var(--color-text-primary)]">{total}</span>
                                {total === 1 ? 'post' : 'posts'} total
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--color-border-strong)]"></span>
                            <span>Page {page}</span>
                        </div>
                    )}
                </div>

                {/* Desktop Grid View */}
                <div className="hidden lg:block space-y-3 animate-fade-in">
                    {q.isLoading &&
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="card p-5">
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-24 skeleton rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-6 w-2/3 skeleton rounded" />
                                        <div className="h-4 w-full skeleton rounded" />
                                        <div className="flex items-center gap-3">
                                            <div className="h-5 w-20 skeleton rounded-full" />
                                            <div className="h-4 w-32 skeleton rounded" />
                                        </div>
                                    </div>
                                    <div className="h-10 w-64 skeleton rounded-lg" />
                                </div>
                            </div>
                        ))}

                    {empty && (
                        <div className="card p-16 text-center animate-scale-in">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="w-20 h-20 mx-auto bg-[var(--color-surface-elevated)] rounded-full flex items-center justify-center">
                                    <Pencil className="h-10 w-10 text-[var(--color-text-tertiary)]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">No posts yet</h3>
                                <p className="text-[var(--color-text-secondary)]">
                                    Start sharing your thoughts with the world. Create your first post to get started.
                                </p>
                                <Link
                                    to="/writer/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-600)] text-white rounded-xl font-semibold hover:bg-[var(--color-brand-700)] transition-all duration-300 mt-4"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create Your First Post
                                </Link>
                            </div>
                        </div>
                    )}

                    {items.map((p) => {
                        const created = formatDateTime(p.created_at);
                        const updated = formatDateTime(p.updated_at);

                        return (
                            <div
                                key={p.id}
                                className="card p-5 hover-lift group"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Cover Image */}
                                    <Link
                                        to={`/post/${p.slug}`}
                                        className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-elevated)] group-hover:shadow-lg transition-all duration-300"
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
                                        <div className={`${p.cover_image ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}>
                                            <ImageIcon className="h-8 w-8 text-[var(--color-text-tertiary)]" />
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start gap-3">
                                            <Link
                                                to={`/post/${p.slug}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors line-clamp-1">
                                                    {p.title}
                                                </h3>
                                            </Link>
                                            <StatusBadge status={p.status} />
                                        </div>

                                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                                            {p.short_description}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium">Created:</span>
                                                <span>{created.date}</span>
                                                <span className="opacity-60">{created.time}</span>
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-[var(--color-border-strong)]"></span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium">Updated:</span>
                                                <span>{updated.date}</span>
                                                <span className="opacity-60">{updated.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link
                                            to={`/post/${p.slug}`}
                                            className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium focus-ring"
                                            title="View post"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span>View</span>
                                        </Link>
                                        <button
                                            onClick={() => navigate(`/writer/edit/${p.slug}`)}
                                            className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-700)] dark:hover:bg-[var(--color-brand-900)] transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium focus-ring"
                                            title="Edit post"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => setToDelete({ slug: p.slug, title: p.title })}
                                            className="px-4 py-2 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-surface)] hover:bg-red-50 hover:border-[var(--color-error)] text-[var(--color-error)] dark:hover:bg-red-950/30 transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium focus-ring"
                                            title="Delete post"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4 animate-fade-in">
                    {q.isLoading &&
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card p-4">
                                <div className="flex gap-4 mb-3">
                                    <div className="w-24 h-24 skeleton rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 w-3/4 skeleton rounded" />
                                        <div className="h-4 w-full skeleton rounded" />
                                        <div className="h-5 w-20 skeleton rounded-full" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-10 skeleton rounded-lg" />
                                    <div className="h-10 skeleton rounded-lg" />
                                    <div className="h-10 skeleton rounded-lg" />
                                </div>
                            </div>
                        ))}

                    {empty && (
                        <div className="card p-12 text-center animate-scale-in">
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-[var(--color-surface-elevated)] rounded-full flex items-center justify-center">
                                    <Pencil className="h-8 w-8 text-[var(--color-text-tertiary)]" />
                                </div>
                                <h3 className="text-xl font-bold">No posts yet</h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Create your first post to get started
                                </p>
                                <Link
                                    to="/writer/new"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-brand-600)] text-white rounded-lg font-semibold hover:bg-[var(--color-brand-700)] transition-all mt-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Post
                                </Link>
                            </div>
                        </div>
                    )}

                    {items.map((p) => {
                        const created = formatDateTime(p.created_at);
                        const updated = formatDateTime(p.updated_at);

                        return (
                            <div key={p.id} className="card p-4 hover-lift">
                                <div className="flex gap-4 mb-4">
                                    {/* Cover Image */}
                                    <Link
                                        to={`/post/${p.slug}`}
                                        className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-surface-elevated)]"
                                    >
                                        {p.cover_image ? (
                                            <img
                                                src={p.cover_image}
                                                alt={p.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`${p.cover_image ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}>
                                            <ImageIcon className="h-6 w-6 text-[var(--color-text-tertiary)]" />
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link to={`/post/${p.slug}`} className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base sm:text-lg text-[var(--color-text-primary)] line-clamp-2 leading-snug">
                                                    {p.title}
                                                </h3>
                                            </Link>
                                        </div>

                                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                                            {p.short_description}
                                        </p>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusBadge status={p.status} />
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="mb-3 pb-3 border-b border-[var(--color-border)] space-y-1 text-xs text-[var(--color-text-tertiary)]">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Created:</span>
                                        <span>{created.date} <span className="opacity-60">{created.time}</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Updated:</span>
                                        <span>{updated.date} <span className="opacity-60">{updated.time}</span></span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-3 gap-2">
                                    <Link
                                        to={`/post/${p.slug}`}
                                        className="px-3 py-2.5 text-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] transition-all text-sm font-medium inline-flex items-center justify-center gap-1.5"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>View</span>
                                    </Link>
                                    <button
                                        onClick={() => navigate(`/writer/edit/${p.slug}`)}
                                        className="px-3 py-2.5 text-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-700)] dark:hover:bg-[var(--color-brand-900)] transition-all text-sm font-medium inline-flex items-center justify-center gap-1.5"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => setToDelete({ slug: p.slug, title: p.title })}
                                        className="px-3 py-2.5 text-center rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-surface)] hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--color-error)] transition-all text-sm font-medium inline-flex items-center justify-center gap-1.5"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {total > pageSize && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                        <div className="text-sm text-[var(--color-text-secondary)] order-2 sm:order-1">
                            Showing page <span className="font-semibold text-[var(--color-text-primary)]">{page}</span>
                            {total > 0 && (
                                <span> of approximately <span className="font-semibold text-[var(--color-text-primary)]">{Math.ceil(total / pageSize)}</span></span>
                            )}
                        </div>
                        <div className="flex gap-3 order-1 sm:order-2">
                            <button
                                disabled={!hasPrev || q.isFetching}
                                onClick={() => setParams({ page: String(Math.max(1, page - 1)) })}
                                className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium focus-ring"
                            >
                                Previous
                            </button>
                            <button
                                disabled={!hasNext || q.isFetching}
                                onClick={() => setParams({ page: String(page + 1) })}
                                className="px-5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium focus-ring"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm delete */}
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