// src/components/posts/PostTags.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Tag as TagIcon } from "lucide-react";
import { getPostTags } from "../../services/tags";
import type { Tag } from "../../types/tag";

type PostTagsProps = {
    slug: string;
};

/**
 * Displays tags for a post with clickable navigation.
 * Clicking a tag navigates to /read?tags=tagname for filtered results.
 */
export function PostTags({ slug }: PostTagsProps) {
    const navigate = useNavigate();

    const { data: tags, isLoading } = useQuery({
        queryKey: ["post", slug, "tags"],
        queryFn: () => getPostTags(slug),
    });

    const handleTagClick = (tag: Tag) => {
        // Navigate to Read page with tag filter
        navigate(`/read?tags=${encodeURIComponent(tag.name)}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-8 w-20 skeleton rounded-full"
                    />
                ))}
            </div>
        );
    }

    if (!tags || tags.length === 0) {
        return null;
    }

    return (
        <div className="mb-10 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <TagIcon className="w-5 h-5 text-[var(--color-brand-600)]" />
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Tags
                </h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag: Tag) => (
                    <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag)}
                        className="
                            inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                            bg-[var(--color-surface)] border border-[var(--color-border)]
                            text-[var(--color-text-secondary)]
                            hover:border-[var(--color-brand-500)]
                            hover:text-[var(--color-brand-600)]
                            hover:bg-[var(--color-brand-50)]
                            dark:hover:bg-[var(--color-brand-900)]
                            transition-all duration-200
                            cursor-pointer
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[var(--color-brand-500)]
                            focus:ring-offset-2
                            active:scale-95
                        "
                        aria-label={`Filter posts by ${tag.name}`}
                    >
                        <TagIcon className="w-3.5 h-3.5 mr-1.5" />
                        {tag.name}
                    </button>
                ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-tertiary)] italic">
                Click on a tag to see all related articles
            </p>
        </div>
    );
}