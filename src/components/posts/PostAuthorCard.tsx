import React from "react";
import Card from "../ui/Card";
import type { PostDetail } from "../../types/user";

interface PostAuthorCardProps {
    author: PostDetail["author"];
}

function getAuthorInitials(author: any) {
    if (!author) return "A";
    const first = author.first_name?.[0] || "";
    const last = author.last_name?.[0] || "";
    return (first + last).toUpperCase() || author.email?.[0]?.toUpperCase() || "A";
}

export function PostAuthorCard({ author }: PostAuthorCardProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {getAuthorInitials(author)}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {author?.full_name || author?.email || "Unknown Author"}
                    </h3>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Content Creator</p>
                </div>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors">
                    Follow
                </button>
            </div>
        </Card>
    );
}