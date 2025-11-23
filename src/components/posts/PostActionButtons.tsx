// src/components/posts/PostActionButtons.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Bookmark } from "lucide-react";
import { addFavourite, removeFavourite, addBookmark, removeBookmark } from "../../services/favourites";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface PostActionButtonsProps {
    slug: string;
}

export function PostActionButtons({ slug }: PostActionButtonsProps) {
    const { accessToken } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isFavourited, setIsFavourited] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Check if post is already favourited/bookmarked
    useEffect(() => {
        if (!accessToken) return;

        const favourites = queryClient.getQueryData<any[]>(["favourites"]);
        const bookmarks = queryClient.getQueryData<any[]>(["bookmarks"]);

        if (favourites) {
            setIsFavourited(favourites.some(f => f.post.slug === slug));
        }

        if (bookmarks) {
            setIsBookmarked(bookmarks.some(b => b.post.slug === slug));
        }
    }, [accessToken, slug, queryClient]);

    const favouriteMutation = useMutation({
        mutationFn: () => isFavourited ? removeFavourite(slug) : addFavourite(slug),
        onSuccess: () => {
            setIsFavourited(!isFavourited);
            queryClient.invalidateQueries({ queryKey: ["favourites"] });
        },
    });

    const bookmarkMutation = useMutation({
        mutationFn: () => isBookmarked ? removeBookmark(slug) : addBookmark(slug),
        onSuccess: () => {
            setIsBookmarked(!isBookmarked);
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        },
    });

    const handleFavourite = () => {
        if (!accessToken) {
            navigate("/login");
            return;
        }
        favouriteMutation.mutate();
    };

    const handleBookmark = () => {
        if (!accessToken) {
            navigate("/login");
            return;
        }
        bookmarkMutation.mutate();
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleFavourite}
                disabled={favouriteMutation.isPending}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    isFavourited
                        ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] border-[var(--color-brand-500)] text-[var(--color-brand-600)]"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <Heart
                    className={`w-5 h-5 transition-all ${
                        isFavourited ? "fill-current" : "group-hover:scale-110"
                    }`}
                />
                <span className="text-sm font-medium">
                    {isFavourited ? "Favourited" : "Favourite"}
                </span>
            </button>

            <button
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                    isBookmarked
                        ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] border-[var(--color-brand-500)] text-[var(--color-brand-600)]"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <Bookmark
                    className={`w-5 h-5 transition-all ${
                        isBookmarked ? "fill-current" : "group-hover:scale-110"
                    }`}
                />
                <span className="text-sm font-medium">
                    {isBookmarked ? "Saved" : "Read Later"}
                </span>
            </button>
        </div>
    );
}