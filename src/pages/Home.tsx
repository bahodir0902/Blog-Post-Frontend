import { useQuery } from "@tanstack/react-query";
import Card from "../components/ui/Card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Eye, BookOpen, ArrowRight } from "lucide-react";
import { getLatestPosts, getTrendingPosts, getHomeStats } from "../services/posts";

export default function Home() {
    const { data: latestPosts, isLoading, isError } = useQuery({
        queryKey: ["latest_posts"],
        queryFn: getLatestPosts,
        staleTime: 5 * 60 * 1000,
    });

    const { data: trendingPosts } = useQuery({
        queryKey: ["trending_posts"],
        queryFn: getTrendingPosts,
        staleTime: 5 * 60 * 1000,
    });

    const { data: stats } = useQuery({
        queryKey: ["home_stats"],
        queryFn: getHomeStats,
        staleTime: 5 * 60 * 1000,
    });

    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidesPerView, setSlidesPerView] = useState(3);
    const maxSlide = latestPosts ? Math.max(0, latestPosts.length - slidesPerView) : 0;

    useEffect(() => {
        const updateSlidesPerView = () => {
            if (window.innerWidth < 640) setSlidesPerView(1);
            else if (window.innerWidth < 1024) setSlidesPerView(2);
            else setSlidesPerView(3);
        };

        updateSlidesPerView();
        window.addEventListener('resize', updateSlidesPerView);
        return () => window.removeEventListener('resize', updateSlidesPerView);
    }, []);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    const getCategoryColor = (index: number) => {
        const colors = ['Technology', 'Design', 'Development'];
        return colors[index % 3];
    };

    const articlesCount = Number(stats?.["Articles"] ?? 0);
    const readers = stats?.["Active Readers"] ?? "50K+";
    const writers = stats?.["Writers"] ?? "100+";

    return (
        <div className="space-y-16 md:space-y-24">
            {/* ================ Hero ================= */}
            <section className="relative py-12 md:py-20 lg:py-24">
                <div className="container-responsive">
                    <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand-500)] animate-pulse"></span>
                            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Welcome to ModernBlog</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-[var(--color-text-primary)]">
                            Discover Stories That
                            <span className="block mt-2 bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] bg-clip-text text-transparent">
                                Inspire & Inform
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-[var(--color-text-secondary)] max-w-3xl mx-auto px-4">
                            Explore thoughtfully crafted articles on technology, design, and development from our community of talented writers.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 px-4">
                            <Link
                                to="/read"
                                className="group w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg bg-[var(--color-brand-600)] text-white shadow-md hover:shadow-lg hover:bg-[var(--color-brand-700)] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                Start Reading
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/explore"
                                className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg border-2 border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] transition-all duration-200"
                            >
                                Browse Topics
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-12 max-w-2xl mx-auto px-4">
                            <div className="space-y-1 md:space-y-2">
                                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] bg-clip-text text-transparent">
                                    {typeof readers === "string" ? readers : readers.toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm font-medium text-[var(--color-text-tertiary)]">Active Readers</div>
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] bg-clip-text text-transparent">
                                    {Number.isFinite(articlesCount) ? articlesCount : 0}
                                </div>
                                <div className="text-xs md:text-sm font-medium text-[var(--color-text-tertiary)]">Articles</div>
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] bg-clip-text text-transparent">
                                    {typeof writers === "string" ? writers : writers.toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm font-medium text-[var(--color-text-tertiary)]">Writers</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================ Latest Articles ================= */}
            <section id="latest" className="container-responsive space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">Latest Articles</h2>
                        <p className="text-base md:text-lg text-[var(--color-text-secondary)]">Fresh perspectives from our community</p>
                    </div>

                    {latestPosts && latestPosts.length > slidesPerView && (
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className="p-2 md:p-3 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                disabled={currentSlide >= maxSlide}
                                className="p-2 md:p-3 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="aspect-[16/10] skeleton" />
                                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                                    <div className="h-5 md:h-6 w-3/4 skeleton rounded" />
                                    <div className="h-4 w-full skeleton rounded" />
                                    <div className="h-4 w-5/6 skeleton rounded" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {isError && (
                    <Card className="p-8 md:p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-[var(--color-text-primary)]">Failed to load posts</h3>
                            <p className="text-sm md:text-base text-[var(--color-text-secondary)]">We couldn't fetch the posts. Please try again later.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] transition-all duration-200 text-sm md:text-base"
                            >
                                Retry
                            </button>
                        </div>
                    </Card>
                )}

                {latestPosts && latestPosts.length > 0 && (
                    <>
                        <div className="overflow-hidden">
                            <div
                                className="flex gap-4 md:gap-6 transition-transform duration-500 ease-out"
                                style={{
                                    transform: `translateX(-${currentSlide * (100 / slidesPerView + (slidesPerView === 1 ? 0 : slidesPerView === 2 ? 2 : 2))}%)`
                                }}
                            >
                                {latestPosts.map((post, index) => (
                                    <div key={post.id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                                        <Card hover className="overflow-hidden group h-full">
                                            <Link to={`/post/${post.slug}`} className="block">
                                                <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)]">
                                                    {post.cover_image ? (
                                                        <img
                                                            src={post.cover_image}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-[var(--color-brand-300)]" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-brand-50)] text-[var(--color-brand-700)] border border-[var(--color-brand-200)]">
                                                            {getCategoryColor(index)}
                                                        </span>
                                                        <span className="text-xs md:text-sm flex items-center gap-1 text-[var(--color-text-tertiary)]">
                                                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                            5 min
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg md:text-xl font-bold line-clamp-2 text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-sm md:text-base line-clamp-2 leading-relaxed text-[var(--color-text-secondary)]">
                                                        {post.short_description}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-[var(--color-border)]">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)]" />
                                                            <div>
                                                                <p className="text-xs md:text-sm font-semibold text-[var(--color-text-primary)]">Author</p>
                                                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                                                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-brand-600)] group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {latestPosts.length > slidesPerView && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            i === currentSlide
                                                ? 'w-8 bg-[var(--color-brand-600)]'
                                                : 'w-2 bg-[var(--color-border-strong)]'
                                        }`}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {latestPosts && latestPosts.length === 0 && (
                    <Card className="p-12 md:p-16 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--color-surface-elevated)]">
                                <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-text-tertiary)]" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]">No posts yet</h3>
                            <p className="text-sm md:text-base text-[var(--color-text-secondary)]">Check back soon for new content!</p>
                        </div>
                    </Card>
                )}
            </section>

            {/* ================ Trending Now ================= */}
            <section className="container-responsive grid md:grid-cols-2 gap-8 md:gap-12">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-brand-600)]" />
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">Trending Now</h2>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {trendingPosts?.map((post, index) => (
                            <Link
                                key={post.id}
                                to={`/post/${post.slug}`}
                                className="group flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-lg transition-all duration-200 bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-sm"
                            >
                                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-lg md:text-xl">
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-1 text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-[var(--color-text-tertiary)]">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            Popular
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            5 min
                                        </span>
                                    </div>
                                </div>

                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-600)] group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Newsletter CTA */}
                <div className="rounded-xl md:rounded-2xl p-6 md:p-8 bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-700)] text-white relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
                    <div className="relative space-y-4 md:space-y-6">
                        <div className="inline-flex p-2.5 md:p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                            <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold">Stay in the Loop</h3>
                        <p className="text-white/90 text-base md:text-lg leading-relaxed">
                            Get the latest articles and insights delivered straight to your inbox every week.
                        </p>
                        <div className="space-y-3 pt-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-lg bg-white/20 backdrop-blur-sm border-2 border-white/30 placeholder-white/60 text-white font-medium focus:outline-none focus:border-white transition-all text-sm md:text-base"
                            />
                            <button className="w-full px-5 md:px-6 py-3 md:py-4 rounded-lg bg-white text-[var(--color-brand-600)] font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg">
                                Subscribe Now
                            </button>
                        </div>
                        <p className="text-white/70 text-xs md:text-sm">Join 50,000+ readers. Unsubscribe anytime.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}