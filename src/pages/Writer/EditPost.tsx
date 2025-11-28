// src/pages/Writer/EditPost.tsx - COMPLETE VERSION
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import WriterEditor from "../../components/Editor/WriterEditor";
import { listCategories } from "../../services/categories";
import { getAuthorPost, updateAuthorPost } from "../../services/authorPosts";
import Dropdown from "../../components/ui/Dropdown";
import DateTimePicker from "../../components/ui/DateTimePicker";
import { ReactionTypePicker } from "../../components/posts/ReactionTypePicker";
import { TagManager } from "../../components/posts/TagManager";
import clsx from "clsx";
type Status = "draft" | "published" | "scheduled" | "archived";
const STATUS_OPTIONS = [
    { label: "Draft", value: "draft" },
    { label: "Publish now", value: "published" },
    { label: "Schedule", value: "scheduled" },
    { label: "Archive", value: "archived" },
];
const STATUS_HINT: Record<Status, string> = {
    draft: "Keep it private. You can come back and publish later.",
    published: "Visible to everyone immediately after saving.",
    scheduled: "Will go live at the scheduled time below.",
    archived: "Hidden from public lists without deleting the content.",
};
function saveButtonLabel(status: Status) {
    switch (status) {
        case "draft":
            return "Save as draft";
        case "published":
            return "Publish now";
        case "scheduled":
            return "Save & schedule";
        case "archived":
            return "Save as archived";
    }
}
export default function EditPost() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const postQ = useQuery({
        queryKey: ["author", "post", slug],
        queryFn: () => getAuthorPost(slug),
    });
    const catQ = useQuery({
        queryKey: ["categories"],
        queryFn: listCategories,
        staleTime: 10 * 60_000,
    });
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<number | "">("");
    const [shortDescription, setShortDescription] = useState("");
    const [status, setStatus] = useState<Status>("draft");
    const [scheduledTime, setScheduledTime] = useState<string>(
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    );
    const [allowedReactions, setAllowedReactions] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [content, setContent] = useState<any>({});
    const [initialContent, setInitialContent] = useState<any>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [originalCoverUrl, setOriginalCoverUrl] = useState<string | null>(null);
    useEffect(() => {
        const p = postQ.data;
        if (!p) return;
        setTitle(p.title);
        setCategory(p.category ?? "");
        setShortDescription(p.short_description);
        setStatus(p.status);
        if (p.published_at) {
            setScheduledTime(p.published_at);
        }
        if (p.allowed_reactions) {
            setAllowedReactions(p.allowed_reactions);
        }
        // FIXED: Map tags to IDs only
        setSelectedTags(p.tags?.map((tag) => tag.id) || []);
        setInitialContent(p.content ?? { blocks: [{ type: "paragraph", content: "" }] });
        setContent(p.content ?? { blocks: [{ type: "paragraph", content: "" }] });
        setCoverPreview(p.cover_image ?? null);
        setOriginalCoverUrl(p.cover_image ?? null);
    }, [postQ.data]);
    function onCoverChange(file?: File) {
        if (!file) {
            setCoverFile(null);
            setCoverPreview(originalCoverUrl);
            return;
        }
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }
    const canSubmit = useMemo(() => {
        return title.trim().length > 3 && shortDescription.trim().length > 10;
    }, [title, shortDescription]);
    const m = useMutation({
        mutationFn: () =>
            updateAuthorPost(slug, {
                title,
                category: category === "" ? null : Number(category),
                short_description: shortDescription,
                content,
                status,
                published_at: status === "scheduled" ? scheduledTime : undefined,
                cover_image: coverFile ?? undefined,
                allowed_reactions: allowedReactions.length > 0 ? allowedReactions : undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["author", "my-posts"] });
            qc.invalidateQueries({ queryKey: ["author", "post", slug] });
            navigate("/writer/my-posts");
        },
    });
    const catOptions = (catQ.data || []).map((c) => ({
        label: c.name,
        value: String(c.id),
    }));
    if (postQ.isLoading) {
        return (
            <div className="container-responsive max-w-7xl py-6">
                <div className="card p-8 text-center space-y-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]">
                        <svg className="animate-spin h-8 w-8 text-[var(--color-brand-600)]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-[var(--color-text-secondary)]">Loading post...</p>
                </div>
            </div>
        );
    }
    if (postQ.isError || !postQ.data) {
        return (
            <div className="container-responsive max-w-7xl py-6">
                <div className="card p-8 text-center space-y-4 animate-scale-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
                        <svg className="w-8 h-8 text-[var(--color-error)]" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Failed to load post</h2>
                    <p className="text-[var(--color-text-secondary)]">The post you're looking for could not be found or loaded.</p>
                    <button
                        onClick={() => navigate("/writer/my-posts")}
                        className="mt-4 px-6 py-2.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] font-medium transition-all"
                    >
                        Back to my posts
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="container-responsive max-w-7xl py-6">
            <div className="mb-8 space-y-2 animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Edit post</h1>
                <p className="text-base md:text-lg text-[var(--color-text-secondary)]">
                    Update your content, change visibility, or schedule publishing.
                </p>
            </div>
            <div className="card p-4 md:p-8 animate-slide-up">
                <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                Title <span className="text-[var(--color-error)]">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-xl border-2 px-4 py-3 bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 transition-all"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={150}
                                placeholder="Give it a clear, compelling title"
                            />
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--color-text-tertiary)]">
                                    {title.length < 4 && title.length > 0 && "Title must be at least 4 characters"}
                                </span>
                                <span
                                    className={clsx(
                                        "font-medium",
                                        title.length > 140 ? "text-[var(--color-warning)]" : "text-[var(--color-text-tertiary)]"
                                    )}
                                >
                                    {title.length}/150
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                Short description <span className="text-[var(--color-error)]">*</span>
                            </label>
                            <textarea
                                className="w-full h-28 rounded-xl border-2 px-4 py-3 bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 transition-all resize-none"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                placeholder="A concise summary shown in previews"
                            />
                            <div className="text-xs text-[var(--color-text-tertiary)]">
                                {shortDescription.length < 11 && shortDescription.length > 0 && "Description must be at least 11 characters"}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">Content</label>
                            <div className="editor-wrapper">
                                {initialContent === null ? (
                                    <div className="h-40 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse" />
                                ) : (
                                    <WriterEditor
                                        key={slug + "|" + (postQ.data?.updated_at ?? "0")}
                                        initialData={initialContent}
                                        onChange={setContent}
                                        postSlug={slug}
                                    />
                                )}
                            </div>
                            <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Content is stored as JSON via BlockNote.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Dropdown
                                label="Category"
                                options={[{ label: "— Uncategorised —", value: "" }, ...catOptions]}
                                value={category === "" ? "" : String(category)}
                                onChange={(val) => setCategory(val === "" ? "" : Number(val))}
                                placeholder="Choose category"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)]">Cover image</label>
                            <div className="flex items-center gap-3 flex-wrap">
                                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] cursor-pointer transition-all font-medium text-sm text-[var(--color-text-primary)]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <input type="file" accept="image/*" hidden onChange={(e) => onCoverChange(e.target.files?.[0])} />
                                    Replace
                                </label>
                                {coverPreview && coverFile && (
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:underline"
                                        onClick={() => {
                                            setCoverFile(null);
                                            setCoverPreview(originalCoverUrl);
                                        }}
                                    >
                                        Keep original
                                    </button>
                                )}
                            </div>
                            {coverPreview && (
                                <div className="mt-4 relative group">
                                    <img
                                        src={coverPreview}
                                        alt="Cover preview"
                                        className="w-full h-48 object-cover rounded-xl border-2 border-[var(--color-border)]"
                                    />
                                    {coverFile && (
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-[var(--color-brand-600)] text-white text-xs font-medium rounded-md">
                                            New
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="border-t border-[var(--color-border)] my-6"></div>
                        <TagManager
                            selectedTagIds={selectedTags}
                            onChange={setSelectedTags}
                        />
                        <div className="border-t border-[var(--color-border)] my-6"></div>
                        <ReactionTypePicker
                            selectedReactionIds={allowedReactions}
                            onChange={setAllowedReactions}
                        />
                        <div className="border-t border-[var(--color-border)] my-6"></div>
                        <div className="space-y-2">
                            <Dropdown
                                label="Post visibility"
                                options={STATUS_OPTIONS}
                                value={status}
                                onChange={(val) => setStatus(val as Status)}
                                placeholder="Select status"
                            />
                            <p className="text-xs text-[var(--color-text-tertiary)] flex items-start gap-2 bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {STATUS_HINT[status]}
                            </p>
                        </div>
                        {status === "scheduled" && (
                            <div className="animate-slide-up">
                                <DateTimePicker
                                    label="Publish at"
                                    value={scheduledTime}
                                    onChange={setScheduledTime}
                                    minDate={new Date()}
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                type="button"
                                disabled={!canSubmit || m.isPending}
                                onClick={() => m.mutate()}
                                className={clsx(
                                    "w-full px-6 py-3.5 rounded-xl font-semibold text-white transition-all focus:outline-none focus:ring-4",
                                    !canSubmit || m.isPending
                                        ? "bg-[var(--color-brand-300)] opacity-60 cursor-not-allowed"
                                        : "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] focus:ring-[var(--color-brand-500)]/30 shadow-lg shadow-[var(--color-brand-500)]/20 hover:shadow-xl hover:shadow-[var(--color-brand-500)]/30 hover:-translate-y-0.5"
                                )}
                            >
                                {m.isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    saveButtonLabel(status)
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full px-6 py-3.5 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] font-semibold text-[var(--color-text-primary)] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-500)]/10"
                            >
                                Cancel
                            </button>
                        </div>
                        {m.isError && (
                            <div className="text-sm text-[var(--color-error)] bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-800 flex items-start gap-3 animate-scale-in">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>{(m.error as any)?.response?.data?.detail ?? "Failed to save post. Please try again."}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}