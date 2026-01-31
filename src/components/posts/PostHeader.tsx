// src/components/posts/PostHeader.tsx
import React from "react";
import { Calendar, Clock, Eye, User } from "lucide-react";
import type { PostDetail } from "../../types/user";

interface PostHeaderProps {
    post: PostDetail;
}

export function PostHeader({ post }: PostHeaderProps) {
    return (
        <header className="mb-8 md:mb-12">
            {/* Category badge */}
            {post.category && (
                <div className="mb-4 animate-fade-in">
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-100)] dark:text-[var(--color-brand-600)] border border-[var(--color-brand-200)] dark:border-[var(--color-brand-300)]">
                        {post.category.name || 'Article'}
                    </span>
                </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-[var(--color-text-primary)] animate-slide-up">
                {post.title}
            </h1>

            {/* Description */}
            {post.short_description && (
                <p className="mt-5 md:mt-6 text-lg md:text-xl lg:text-2xl text-[var(--color-text-secondary)] leading-relaxed max-w-4xl animate-slide-up-delay-1">
                    {post.short_description}
                </p>
            )}

            {/* Meta row */}
            <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 animate-slide-up-delay-2">
                {/* Author */}
                <div className="flex items-center gap-3">
                    {post.author?.profile_photo ? (
                        <img
                            src={post.author.profile_photo}
                            alt={post.author.first_name}
                            className="w-11 h-11 rounded-xl object-cover border-2 border-[var(--color-border)] shadow-sm"
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {post.author?.first_name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {post.author?.full_name || `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Author'}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Author</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-[var(--color-border)]" />

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[var(--color-surface-elevated)]">
                            <Calendar className="w-4 h-4 text-[var(--color-brand-600)]" />
                        </div>
                        <time dateTime={post.created_at} className="font-medium">
                            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[var(--color-surface-elevated)]">
                            <Clock className="w-4 h-4 text-[var(--color-brand-600)]" />
                        </div>
                        <span className="font-medium">{post.read_time} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[var(--color-surface-elevated)]">
                            <Eye className="w-4 h-4 text-[var(--color-brand-600)]" />
                        </div>
                        <span className="font-medium">{post.views_unique?.toLocaleString() || 0} views</span>
                    </div>
                </div>
            </div>
        </header>
    );
}