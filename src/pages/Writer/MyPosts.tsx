// src/pages/Writer/MyPosts.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { getMyPosts } from "../../services/authorPosts";

export default function MyPosts() {
    const [params, setParams] = useSearchParams();
    const page = Number(params.get("page") || "1");

    const q = useQuery({
        queryKey: ["author", "my-posts", page],
        queryFn: () => getMyPosts(page),
        keepPreviousData: true,
    });

    const items = q.data?.results ?? [];
    const total = q.data?.count ?? items.length;
    const pageSize = items.length ? items.length : 10; // fallback

    const hasNext = Boolean(q.data?.next);
    const hasPrev = Boolean(q.data?.previous) || page > 1;

    return (
        <div className="container-responsive max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">My Posts</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Only you (and admins) can see drafts; published items are public.
                    </p>
                </div>
                <Link
                    to="/writer/new"
                    className="btn rounded-lg px-4 py-2 bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] focus-ring"
                >
                    + Create post
                </Link>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--color-surface-elevated)]">
                    <tr className="text-sm text-[var(--color-text-tertiary)]">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3 hidden md:table-cell">Description</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {q.isLoading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="border-t border-[var(--color-border)]">
                                <td className="px-4 py-4"><div className="h-5 w-48 skeleton rounded" /></td>
                                <td className="px-4 py-4 hidden md:table-cell"><div className="h-5 w-64 skeleton rounded" /></td>
                                <td className="px-4 py-4"><div className="h-5 w-24 skeleton rounded" /></td>
                                <td className="px-4 py-4"><div className="h-5 w-24 skeleton rounded" /></td>
                                <td className="px-4 py-4 text-right"><div className="h-8 w-24 skeleton rounded" /></td>
                            </tr>
                        ))}

                    {!q.isLoading && items.length === 0 && (
                        <tr className="border-t border-[var(--color-border)]">
                            <td className="px-4 py-10 text-center text-[var(--color-text-secondary)]" colSpan={5}>
                                You haven’t written anything yet. <Link to="/writer/new" className="underline">Create your first post</Link>.
                            </td>
                        </tr>
                    )}

                    {items.map((p) => (
                        <tr key={p.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]">
                            <td className="px-4 py-3 font-medium">{p.title}</td>
                            <td className="px-4 py-3 hidden md:table-cell truncate max-w-[420px]">{p.short_description}</td>
                            <td className="px-4 py-3 text-sm">{new Date(p.created_at).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm">{new Date(p.updated_at).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                                {/* Client detail route (will 404 if not published, which is OK) */}
                                <Link
                                    to={`/post/${p.slug}`}
                                    className="px-3 py-1.5 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]"
                                >
                                    Open
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {total > pageSize && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-[var(--color-text-secondary)]">
                        Page {page}
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={!hasPrev || q.isFetching}
                            onClick={() => setParams({ page: String(Math.max(1, page - 1)) })}
                            className="px-3 py-1.5 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            disabled={!hasNext || q.isFetching}
                            onClick={() => setParams({ page: String(page + 1) })}
                            className="px-3 py-1.5 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
