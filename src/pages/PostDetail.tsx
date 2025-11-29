// src/pages/PostDetail.tsx - UPDATED
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { getPost, getRelatedPosts } from "../services/posts";
import { toBlocks } from "../components/utils/blockNoteUtils";
import Card from "../components/ui/Card";
import CommentsSection from "../components/CommentsSection";
import { PostHeader } from "../components/posts/PostHeader";
import { PostContent } from "../components/posts/PostContent";
import { PostAuthorCard } from "../components/posts/PostAuthorCard";
import { PostShareCard } from "../components/posts/PostShareCard";
import { RelatedPosts } from "../components/posts/RelatedPosts";
import { PostActionButtons } from "../components/posts/PostActionButtons";
import { PostReactions } from "../components/posts/PostReactions";
import { PostTags } from "../components/posts/PostTags"; // NEW
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function PostDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { user } = useCurrentUser();

    const { data: post, isLoading, isError } = useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPost(slug!),
        enabled: !!slug,
    });

    const { data: relatedPosts } = useQuery({
        queryKey: ["relatedPosts", slug],
        queryFn: () => getRelatedPosts(slug!),
        enabled: !!slug,
    });

    const blocks = useMemo(() => toBlocks(post?.content), [post?.content]);
    const isAuthor = user && post && user.id === post.author.id;

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 w-3/4 skeleton" />
                    <div className="h-6 w-1/2 skeleton" />
                    <div className="aspect-[21/9] skeleton rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-4 w-full skeleton" />
                        <div className="h-4 w-full skeleton" />
                        <div className="h-4 w-3/4 skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Post not found</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">The post you're looking for doesn't exist or has been removed.</p>
                    <Link to="/">
                        <button className="btn px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white">
                            Back to Home
                        </button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            {/* breadcrumb */}
            <nav className="mb-6 md:mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                    <Link to="/" className="hover:text-[var(--color-brand-500)] transition-colors">Home</Link>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-[var(--color-text-primary)] line-clamp-1">{post.title}</span>
                </div>

                {isAuthor && (
                    <Link to={`/writer/edit/${slug}`}>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-all">
                            <Edit className="w-4 h-4" />
                            <span className="text-sm font-medium">Edit</span>
                        </button>
                    </Link>
                )}
            </nav>

            {/* header */}
            <PostHeader post={post} />

            {/* Action buttons - Favourite & Read Later */}
            <div className="mb-8 flex justify-center">
                <PostActionButtons slug={slug!} />
            </div>

            {/* cover */}
            {post.cover_image && (
                <div className="mb-10 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-lg)]">
                    <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
                </div>
            )}

            {/* content */}
            <PostContent blocks={blocks} />

            {/* TAGS SECTION - NEW! Display after content, before reactions */}
            {slug && <PostTags slug={slug} />}

            {/* REACTIONS SECTION */}
            {slug && <PostReactions slug={slug} />}

            {/* author + share */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 mt-12">
                <PostAuthorCard author={post.author} />
                <PostShareCard />
            </div>

            {/* related posts */}
            <RelatedPosts posts={relatedPosts || []} />

            {/* COMMENTS SECTION */}
            {post.allow_comments ? (
                slug && <CommentsSection postSlug={slug} />
            ) : (
                <div className="text-center py-8 text-[var(--color-text-secondary)] border-t border-[var(--color-border)] mt-8">
                    Comments are turned off for this post.
                </div>
            )}
        </article>
    );
}