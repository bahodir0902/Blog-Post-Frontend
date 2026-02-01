// src/pages/Writer/CreatePost.tsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import WriterEditor from "../../components/Editor/WriterEditor";
import { listCategories } from "../../services/categories";
import { createAuthorPost, adoptImages } from "../../services/authorPosts";
import Dropdown from "../../components/ui/Dropdown";
import DateTimePicker from "../../components/ui/DateTimePicker";
import { ReactionTypePicker } from "../../components/posts/ReactionTypePicker";
import { TagManager } from "../../components/posts/TagManager";
import clsx from "clsx";

type Status = "draft" | "published" | "scheduled" | "archived";

const STATUS_OPTIONS_KEYS: Record<Status, string> = {
    draft: "writer.status.draft",
    published: "writer.status.published",
    scheduled: "writer.status.scheduled",
    archived: "writer.status.archived",
};

const STATUS_HINT_KEYS: Record<Status, string> = {
    draft: "writer.statusHint.draft",
    published: "writer.statusHint.published",
    scheduled: "writer.statusHint.scheduled",
    archived: "writer.statusHint.archived",
};

const SAVE_BUTTON_KEYS: Record<Status, string> = {
    draft: "writer.saveAsDraft",
    published: "writer.publishNow",
    scheduled: "writer.saveAndSchedule",
    archived: "writer.saveAsArchived",
};

export default function CreatePost() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");

    const STATUS_OPTIONS = [
        { label: t("writer.status.draft"), value: "draft" },
        { label: t("writer.status.published"), value: "published" },
        { label: t("writer.status.scheduled"), value: "scheduled" },
        { label: t("writer.status.archived"), value: "archived" },
    ];
    const [category, setCategory] = useState<number | "">("");
    const [shortDescription, setShortDescription] = useState("");
    const [status, setStatus] = useState<Status>("draft");
    const [scheduledTime, setScheduledTime] = useState<string>(
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    );
    const [content, setContent] = useState<any>({});
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [allowedReactions, setAllowedReactions] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [allowComments, setAllowComments] = useState(true);

    const catQ = useQuery({
        queryKey: ["categories"],
        queryFn: listCategories,
        staleTime: 10 * 60_000
    });

    const tempImageIds = useRef<number[]>([]);
    const onTempImage = (id: number) => tempImageIds.current.push(id);

    const canSubmit = useMemo(() =>
            title.trim().length > 3 && shortDescription.trim().length > 10,
        [title, shortDescription]
    );


    const m = useMutation({
        mutationFn: () =>
            createAuthorPost({
                title,
                category: category === "" ? null : Number(category),
                short_description: shortDescription,
                content,
                status,
                published_at: status === "scheduled" ? scheduledTime : undefined,
                cover_image: coverFile ?? undefined,
                // FIX: Always send these arrays
                allowed_reactions: allowedReactions, // Will be empty array if none selected
                tags: selectedTags, // Will be empty array if none selected
                allow_comments: allowComments,
            }),
        onSuccess: async (post) => {
            const ids = tempImageIds.current;
            if (ids.length) {
                try {
                    await adoptImages(post.slug, ids);
                } catch (e) {
                    console.error("Failed to adopt images:", e);
                }
            }
            navigate("/writer/my-posts");
        },
    });

    function onCoverChange(file?: File) {
        if (!file) {
            setCoverFile(null);
            setCoverPreview(null);
            return;
        }
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }

    const catOptions = (catQ.data || []).map(c => ({
        label: c.name,
        value: String(c.id)
    }));

    return (
        <div className="container-responsive max-w-7xl py-6">
            <div className="mb-8 space-y-2 animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    {t("writer.createPost")}
                </h1>
                <p className="text-base md:text-lg text-[var(--color-text-secondary)]">
                    {t("writer.createPostSubtitle")}
                </p>
            </div>

            <div className="card p-4 md:p-8 animate-slide-up">
                <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label
                                className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                {t("writer.title")} <span className="text-[var(--color-error)]">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={150}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("writer.titlePlaceholder")}
                                className="w-full rounded-xl border-2 px-4 py-3 bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 transition-all"
                            />
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[var(--color-text-tertiary)]">
                                    {title.length < 4 && title.length > 0 && t("writer.titleMinLength")}
                                </span>
                                <span className={clsx(
                                    "font-medium",
                                    title.length > 140 ? "text-[var(--color-warning)]" : "text-[var(--color-text-tertiary)]"
                                )}>
                                    {title.length}/150
                                </span>
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="space-y-2">
                            <label
                                className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                {t("writer.shortDescription")} <span
                                className="text-[var(--color-error)]">*</span>
                            </label>
                            <textarea
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                className="w-full h-28 rounded-xl border-2 px-4 py-3 bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10 transition-all resize-none"
                                placeholder={t("writer.shortDescriptionPlaceholder")}
                            />
                            <div className="text-xs text-[var(--color-text-tertiary)]">
                                {shortDescription.length < 11 && shortDescription.length > 0 && t("writer.descriptionMinLength")}
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="space-y-2">
                            <label
                                className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                {t("writer.content")}
                            </label>
                            <div className="editor-wrapper">
                                <WriterEditor
                                    initialData={{blocks: [{type: "paragraph", content: ""}]}}
                                    onChange={setContent}
                                    onTempImage={onTempImage}
                                />
                            </div>
                            <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"/>
                                </svg>
                                {t("writer.contentInfo")}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Category Dropdown */}
                        <div className="space-y-2">
                            <Dropdown
                                label={t("writer.category")}
                                options={[{label: t("writer.uncategorised"), value: ""}, ...catOptions]}
                                value={category === "" ? "" : String(category)}
                                onChange={(val) => setCategory(val === "" ? "" : Number(val))}
                                placeholder={t("writer.selectCategory")}
                            />
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-2">
                            <label
                                className="block text-sm font-semibold text-[var(--color-text-primary)]">
                                {t("writer.coverImage")}
                            </label>
                            <div className="flex items-center gap-3">
                                <label
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-brand-500)] cursor-pointer transition-all font-medium text-sm text-[var(--color-text-primary)]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                    </svg>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => onCoverChange(e.target.files?.[0])}
                                    />
                                    {t("writer.upload")}
                                </label>
                                {coverPreview && (
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-[var(--color-error)] hover:underline"
                                        onClick={() => onCoverChange(undefined)}
                                    >
                                        {t("writer.remove")}
                                    </button>
                                )}
                            </div>
                            {coverPreview && (
                                <div className="mt-4 relative group">
                                    <img
                                        src={coverPreview}
                                        alt={t("writer.coverPreview")}
                                        className="w-full h-48 object-cover rounded-xl border-2 border-[var(--color-border)]"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-[var(--color-border)] my-6"></div>

                        {/* TAG MANAGER - NEW! */}
                        <TagManager
                            selectedTagIds={selectedTags}
                            onChange={setSelectedTags}
                        />

                        <div className="border-t border-[var(--color-border)] my-6"></div>

                        {/* REACTION TYPE PICKER */}
                        <ReactionTypePicker
                            selectedReactionIds={allowedReactions}
                            onChange={setAllowedReactions}
                        />

                        <div className="border-t border-[var(--color-border)] my-6"></div>

                        <div className="space-y-2">
                            <label
                                className="block text-sm font-semibold text-[var(--color-text-primary)]">{t("writer.allowComments")}</label>
                            <div
                                className="flex items-center justify-between bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                                <span className="text-sm text-[var(--color-text-secondary)]">{t("writer.enableComments")}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={allowComments}
                                        onChange={(e) => setAllowComments(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div
                                        className="w-11 h-6 bg-[var(--color-border-strong)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-brand-500)]/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--color-brand-600)]"></div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-[var(--color-border)] my-6"></div>

                        {/* Status Dropdown */}
                        <div className="space-y-2">
                            <Dropdown
                                label={t("writer.postVisibility")}
                                options={STATUS_OPTIONS}
                                value={status}
                                onChange={(v) => setStatus(v as Status)}
                                placeholder={t("writer.selectStatus")}
                            />
                            <p className="text-xs text-[var(--color-text-tertiary)] flex items-start gap-2 bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"/>
                                </svg>
                                {t(STATUS_HINT_KEYS[status])}
                            </p>
                        </div>

                        {status === "scheduled" && (
                            <div className="animate-slide-up">
                                <DateTimePicker
                                    label={t("writer.publishAt")}
                                    value={scheduledTime}
                                    onChange={setScheduledTime}
                                    minDate={new Date()}
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4">
                            <button
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
                                        <svg className="animate-spin h-5 w-5" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                    stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t("common.saving")}
                                    </span>
                                ) : t(SAVE_BUTTON_KEYS[status])}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full px-6 py-3.5 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-strong)] font-semibold text-[var(--color-text-primary)] transition-all focus:outline-none focus:ring-4 focus:ring-[var(--color-brand-500)]/10"
                            >
                                {t("common.cancel")}
                            </button>
                        </div>

                        {m.isError && (
                            <div
                                className="text-sm text-[var(--color-error)] bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-800 flex items-start gap-3 animate-scale-in">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span>
                                    {(m.error as any)?.response?.data?.detail ?? t("writer.saveError")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}