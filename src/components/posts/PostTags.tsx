// src/components/posts/PostTags.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Tag as TagIcon } from "lucide-react";
import { getPostTags } from "../../services/tags";
import type { Tag } from "../../types/tag";

type PostTagsProps = {
    slug: string;
};

export function PostTags({ slug }: PostTagsProps) {
    const { data: tags, isLoading } = useQuery({
        queryKey: ["post", slug, "tags"],
        queryFn: () => getPostTags(slug),
    });

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
                    <span
                        key={tag.id}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-all cursor-default"
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
        </div>
    );
}