import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "../services/posts";
import Card from "../components/ui/Card";

export default function PostDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { data: post, isLoading, isError } = useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPost(slug!),
        enabled: !!slug,
    });

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
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        Post not found
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        The post you're looking for doesn't exist or has been removed.
                    </p>
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
        <article className="max-w-4xl mx-auto animate-fade-in">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                <Link to="/" className="hover:text-[var(--color-brand-500)] transition-colors">
                    Home
                </Link>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[var(--color-text-primary)]">{post.title}</span>
            </nav>

            {/* Header */}
            <header className="mb-8 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] leading-tight">
                    {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </time>
                    </div>

                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>5 min read</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>1.2K views</span>
                    </div>
                </div>

                {/* Short Description */}
                {post.short_description && (
                    <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed">
                        {post.short_description}
                    </p>
                )}
            </header>

            {/* Cover Image */}
            {post.cover_image && (
                <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            {/* Content */}
            <Card className="p-8 md:p-12 mb-12">
                <div className="prose prose-lg max-w-none">
                    {/* If content is JSON from a rich text editor, you'd render it properly */}
                    {/* For now, showing it as formatted JSON */}
                    {typeof post.content === "object" ? (
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[var(--color-brand-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Content Structure (JSON)
                                </h3>
                                <pre className="text-sm overflow-x-auto p-4 rounded-lg bg-[var(--color-background)] text-[var(--color-text-secondary)] font-mono">
                  {JSON.stringify(post.content, null, 2)}
                </pre>
                            </div>
                            <p className="text-sm text-[var(--color-text-tertiary)] italic">
                                💡 Tip: This is the raw JSON content. In production, you'd use a proper rich text renderer
                                like Tiptap, Slate, or Draft.js to display this content beautifully.
                            </p>
                        </div>
                    ) : (
                        <div
                            className="text-[var(--color-text-secondary)] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    )}
                </div>
            </Card>

            {/* Author & Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Author Card */}
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            A
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-[var(--color-text-primary)]">Author Name</h3>
                            <p className="text-sm text-[var(--color-text-tertiary)]">Content Creator</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors">
                            Follow
                        </button>
                    </div>
                </Card>

                {/* Share Card */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">Share this post</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Related Posts Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Related Articles
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} hover className="overflow-hidden group">
                            <div className="aspect-[16/9] bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)] dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]" />
                            <div className="p-4 space-y-2">
                                <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-500)] transition-colors line-clamp-2">
                                    Related Post Title {i}
                                </h3>
                                <p className="text-sm text-[var(--color-text-tertiary)]">5 min read</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </article>
    );
}