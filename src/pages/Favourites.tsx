// src/pages/Favourites.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { listFavourites } from "../services/favourites";
import Card from "../components/ui/Card";

export default function Favourites() {
    const { data: favourites, isLoading, isError } = useQuery({
        queryKey: ["favourites"],
        queryFn: listFavourites,
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
                    <p className="text-[var(--color-text-secondary)]">Failed to load favourites</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container-responsive py-12 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                    My Favourites
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    {favourites?.length || 0} saved {favourites?.length === 1 ? "article" : "articles"}
                </p>
            </div>

            {!favourites || favourites.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-600)] mb-4">
                        <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        No favourites yet
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        Start exploring and save your favourite articles
                    </p>
                    <Link to="/explore">
                        <button className="btn px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white">
                            Explore Articles
                        </button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {favourites.map((fav) => (
                        <Link key={fav.id} to={`/post/${fav.post.slug}`}>
                            <Card className="overflow-hidden h-full group">
                                {fav.post.cover_image && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={fav.post.cover_image}
                                            alt={fav.post.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--color-brand-600)] transition-colors">
                                        {fav.post.title}
                                    </h3>
                                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-3 mb-4">
                                        {fav.post.short_description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                                        <Heart className="w-3.5 h-3.5 fill-current text-[var(--color-brand-500)]" />
                                        <span>Saved {new Date(fav.created_at).toLocaleDateString()}</span>
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