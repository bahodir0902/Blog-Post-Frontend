// src/pages/Writer/CreatePost.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import WriterEditor from "../../components/Editor/WriterEditor";
import { listCategories } from "../../services/categories";
import { createAuthorPost } from "../../services/authorPosts";
import clsx from "clsx";

type Status = "draft" | "published" | "scheduled" | "archived";

export default function CreatePost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<number | "">("");
    const [shortDescription, setShortDescription] = useState("");
    const [status, setStatus] = useState<Status>("draft");
    const [content, setContent] = useState<any>({});
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const catQ = useQuery({ queryKey: ["categories"], queryFn: listCategories, staleTime: 10 * 60_000 });

    const canSubmit = useMemo(() => {
        return title.trim().length > 3 && shortDescription.trim().length > 10;
    }, [title, shortDescription]);

    const m = useMutation({
        mutationFn: () =>
            createAuthorPost({
                title,
                category: category === "" ? null : Number(category),
                short_description: shortDescription,
                content,
                status,
                cover_image: coverFile ?? undefined,
            }),
        onSuccess: () => {
            navigate("/writer/my-posts");
        },
    });

    function onCoverChange(file: File | undefined) {
        if (!file) {
            setCoverFile(null);
            setCoverPreview(null);
            return;
        }
        setCoverFile(file);
        const url = URL.createObjectURL(file);
        setCoverPreview(url);
    }

    return (
        <div className="container-responsive max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create a new post</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Save as draft, publish now, or schedule it for later.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setStatus("draft")}
                        className={clsx(
                            "btn px-4 py-2 rounded-lg border focus-ring",
                            status === "draft"
                                ? "bg-[var(--color-brand-500)] text-white border-transparent"
                                : "bg-[var(--color-surface)] border-[var(--color-border)]"
                        )}
                    >
                        Save draft
                    </button>
                    <button
                        onClick={() => setStatus("published")}
                        className={clsx(
                            "btn px-4 py-2 rounded-lg border focus-ring",
                            status === "published"
                                ? "bg-[var(--color-brand-600)] text-white border-transparent"
                                : "bg-[var(--color-surface)] border-[var(--color-border)]"
                        )}
                    >
                        Publish
                    </button>
                    <button
                        onClick={() => setStatus("scheduled")}
                        className={clsx(
                            "btn px-4 py-2 rounded-lg border focus-ring",
                            status === "scheduled"
                                ? "bg-[var(--color-brand-700)] text-white border-transparent"
                                : "bg-[var(--color-surface)] border-[var(--color-border)]"
                        )}
                    >
                        Schedule
                    </button>
                </div>
            </div>

            {/* Card */}
            <div className="card p-6">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left (form) */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block font-medium mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="Make it short and punchy"
                                className="w-full rounded-lg border px-3 py-2 bg-[var(--color-surface)] border-[var(--color-border)] focus-ring"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={150}
                            />
                            <div className="text-sm text-[var(--color-text-tertiary)] mt-1">
                                {title.length}/150
                            </div>
                        </div>

                        {/* Short description */}
                        <div>
                            <label className="block font-medium mb-1">Short description</label>
                            <textarea
                                placeholder="A brief teaser shown in cards and previews"
                                className="w-full h-24 rounded-lg border px-3 py-2 bg-[var(--color-surface)] border-[var(--color-border)] focus-ring"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                            />
                        </div>

                        {/* Editor */}
                        <div>
                            <label className="block font-medium mb-2">Content</label>
                            <div className="rounded-xl border border-[var(--color-border)] p-3">
                                <WriterEditor
                                    initialData={{ blocks: [{ type: "paragraph", data: { text: "" } }] }}
                                    onChange={setContent}
                                />
                            </div>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                                Powered by Editor.js. Content is stored as JSON (perfect for your JSONField).
                            </p>
                        </div>
                    </div>

                    {/* Right (meta) */}
                    <div className="space-y-6">
                        {/* Category */}
                        <div>
                            <label className="block font-medium mb-1">Category</label>
                            <select
                                className="w-full rounded-lg border px-3 py-2 bg-[var(--color-surface)] border-[var(--color-border)] focus-ring"
                                value={category}
                                onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : "")}
                            >
                                <option value="">— Uncategorised —</option>
                                {catQ.data?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cover image */}
                        <div>
                            <label className="block font-medium mb-1">Cover image</label>
                            <div className="flex items-center gap-3">
                                <label className="btn border rounded-lg px-3 py-2 cursor-pointer bg-[var(--color-surface)] border-[var(--color-border)]">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => onCoverChange(e.target.files?.[0])}
                                    />
                                    Upload…
                                </label>
                                {coverPreview && (
                                    <button
                                        className="text-sm text-[var(--color-error)]"
                                        onClick={() => onCoverChange(undefined)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            {coverPreview && (
                                <img
                                    src={coverPreview}
                                    alt="Cover preview"
                                    className="mt-3 rounded-lg border border-[var(--color-border)]"
                                />
                            )}
                        </div>

                        {/* Status note */}
                        <div className="rounded-lg border border-[var(--color-border)] p-3 bg-[var(--color-surface-elevated)] text-sm">
                            <div className="font-semibold mb-1">Status: {status.toUpperCase()}</div>
                            {status === "scheduled" ? (
                                <div className="text-[var(--color-text-secondary)]">
                                    Scheduling is enabled on the backend later (you’ve already wired the{" "}
                                    <code>status</code>). Once implemented, you can add a date-time field here to set
                                    <code>published_at</code>.
                                </div>
                            ) : (
                                <div className="text-[var(--color-text-secondary)]">
                                    Drafts stay private. Published posts appear in the public feed immediately.
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                disabled={!canSubmit || m.isPending}
                                onClick={() => m.mutate()}
                                className={clsx(
                                    "btn w-full px-4 py-2 rounded-lg text-white focus-ring",
                                    !canSubmit || m.isPending
                                        ? "bg-[var(--color-brand-300)] opacity-70"
                                        : "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)]"
                                )}
                            >
                                {m.isPending ? "Saving…" : status === "published" ? "Publish now" : "Save"}
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full px-4 py-2 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] focus-ring"
                            >
                                Cancel
                            </button>
                        </div>

                        {m.isError && (
                            <div className="text-sm text-[var(--color-error)]">
                                {(m.error as any)?.response?.data?.detail ?? "Failed to save post."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
