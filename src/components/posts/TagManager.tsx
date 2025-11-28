// src/components/posts/TagManager.tsx
import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Tag as TagIcon, Loader2 } from "lucide-react";
import { listTags, createTag } from "../../services/tags";
import clsx from "clsx";

type TagManagerProps = {
    selectedTagIds: number[];
    onChange: (tagIds: number[]) => void;
};

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function TagManager({ selectedTagIds, onChange }: TagManagerProps) {
    const qc = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: allTags = [], isLoading } = useQuery({
        queryKey: ["tags"],
        queryFn: listTags,
        staleTime: 5 * 60_000,
    });

    const createMutation = useMutation({
        mutationFn: createTag,
        onSuccess: (newTag) => {
            qc.invalidateQueries({ queryKey: ["tags"] });
            onChange([...selectedTagIds, newTag.id]);
            setSearchQuery("");
            setIsCreating(false);
            inputRef.current?.focus();
        },
    });

    const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));
    const availableTags = allTags.filter((t) => !selectedTagIds.includes(t.id));

    const filteredTags = availableTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exactMatch = allTags.find(
        (t) => t.name.toLowerCase() === searchQuery.toLowerCase()
    );

    const canCreate = searchQuery.trim().length > 0 && !exactMatch;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchQuery("");
                setIsCreating(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleRemoveTag(tagId: number) {
        onChange(selectedTagIds.filter((id) => id !== tagId));
    }

    function handleSelectTag(tagId: number) {
        onChange([...selectedTagIds, tagId]);
        setSearchQuery("");
        inputRef.current?.focus();
    }

    function handleCreateTag() {
        if (!canCreate || createMutation.isPending) return;
        const slug = generateSlug(searchQuery);
        setIsCreating(true);
        createMutation.mutate({ name: searchQuery.trim(), slug });
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
            </label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                    {selectedTags.map((tag) => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)] border border-[var(--color-brand-300)] dark:border-[var(--color-brand-700)] transition-all"
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag.id)}
                                className="hover:bg-[var(--color-brand-200)] dark:hover:bg-[var(--color-brand-800)] rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
                <div
                    className={clsx(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all cursor-pointer",
                        isOpen
                            ? "border-[var(--color-brand-500)] ring-4 ring-[var(--color-brand-500)]/10"
                            : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                        "bg-[var(--color-background)]"
                    )}
                    onClick={() => {
                        setIsOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                >
                    <TagIcon className="w-4 h-4 text-[var(--color-text-tertiary)] flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search or create tags..."
                        className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none text-sm"
                    />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-[var(--shadow-xl)] animate-slideDown overflow-hidden">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)]">
                                    Loading tags...
                                </div>
                            ) : (
                                <>
                                    {filteredTags.length > 0 ? (
                                        <div className="py-1">
                                            {filteredTags.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => handleSelectTag(tag.id)}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-2"
                                                >
                                                    <TagIcon className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                                    {tag.name}
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchQuery.trim() ? (
                                        <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)]">
                                            No matching tags found
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-[var(--color-text-tertiary)]">
                                            Start typing to search tags
                                        </div>
                                    )}

                                    {/* Create New Tag Button */}
                                    {canCreate && (
                                        <>
                                            <div className="border-t border-[var(--color-border)] my-1" />
                                            <button
                                                type="button"
                                                onClick={handleCreateTag}
                                                disabled={createMutation.isPending || isCreating}
                                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {createMutation.isPending || isCreating ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4" />
                                                        Create "{searchQuery.trim()}"
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
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
                Select existing tags or create new ones. Tags help organize your content.
            </p>
        </div>
    );
}