// src/pages/Bookmarks.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { listBookmarks } from "../services/favourites";
import Card from "../components/ui/Card";

export default function Bookmarks() {
    const { t } = useTranslation();
    const { data: bookmarks, isLoading, isError } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: listBookmarks,
    });

    if (isLoading) {
        return (
            <div className="container-responsive py-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-48 skeleton rounded-lg" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 skeleton rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container-responsive py-12">
                <Card className="p-8 text-center">
                    <p className="text-[var(--color-text-secondary)]">Failed to load bookmarks</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container-responsive py-12 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                    {t('bookmarks.title')}
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    {t('bookmarks.subtitle')}
                </p>
            </div>

            {!bookmarks || bookmarks.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-600)] mb-4">
                        <Bookmark className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        {t('bookmarks.noBookmarks')}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        {t('bookmarks.noBookmarksDescription')}
                    </p>
                    <Link to="/explore">
                        <button className="btn px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white">
                            {t('explore.title')}
                        </button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookmarks.map((bookmark) => (
                        <Link key={bookmark.id} to={`/post/${bookmark.post.slug}`}>
                            <Card className="overflow-hidden h-full group">
                                {bookmark.post.cover_image && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={bookmark.post.cover_image}
                                            alt={bookmark.post.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                                        {bookmark.post.title}
                                    </h3>
                                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-3 mb-4">
                                        {bookmark.post.short_description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                                        <Bookmark className="w-3.5 h-3.5 fill-current text-[var(--color-brand-500)]" />
                                        <span>Saved {new Date(bookmark.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}