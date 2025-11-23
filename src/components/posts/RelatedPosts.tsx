import React from "react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import type { PostListItem } from "../../types/user";

interface RelatedPostsProps {
    posts: PostListItem[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {posts.slice(0, 3).map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/post/${relatedPost.slug}`}>
                        <Card hover className="overflow-hidden group h-full">
                            <div className="aspect-[16/9] relative overflow-hidden">
                                {relatedPost.cover_image ? (
                                    <img
                                        src={relatedPost.cover_image}
                                        alt={relatedPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)] dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]" />
                                )}
                            </div>
                            <div className="p-4 space-y-2">
                                <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-500)] transition-colors line-clamp-2">
                                    {relatedPost.title}
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                                    {relatedPost.short_description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] pt-2">
                                    <time dateTime={relatedPost.created_at}>
                                        {new Date(relatedPost.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                        })}
                                    </time>
                                    <span>•</span>
                                    <span>5 min read</span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
}