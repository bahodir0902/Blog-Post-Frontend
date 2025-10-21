import { useQuery } from "@tanstack/react-query";
import Card from "../components/ui/Card";
import Aurora from '../components/ui/HomePageBG';
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Eye, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { getLatestPosts, getTrendingPosts, getHomeStats } from "../services/posts";

/* ---------- theme detection ---------- */
function useIsDarkTheme() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const html = document.documentElement;
        return html.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const html = document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDark(html.classList.contains('dark'));
        });
        observer.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e: MediaQueryListEvent) => setIsDark(html.classList.contains('dark') || e.matches);
        mq.addEventListener('change', onChange);

        return () => {
            observer.disconnect();
            mq.removeEventListener('change', onChange);
        };
    }, []);

    return isDark;
}

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

    const isDark = useIsDarkTheme();

    const auroraStops = useMemo(
        () => (isDark ? ["#3A29FF", "#FF94B4", "#FF3232"] : ["#7B6CFF", "#FFB7D2", "#FF7A7A"]),
        [isDark]
    );

    const overlayClass = isDark
        ? "bg-gradient-to-b from-black/10 via-transparent to-[rgb(10,10,14)/.6]"
        : "bg-gradient-to-b from-white/70 via-white/20 to-white/80";

    const headlineClass = isDark ? "text-white" : "text-gray-900";
    const subheadClass = isDark ? "text-gray-300" : "text-gray-700";

    const [currentSlide, setCurrentSlide] = useState(0);
    const slidesPerView = 3;
    const maxSlide = latestPosts ? Math.max(0, latestPosts.length - slidesPerView) : 0;

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
        <div className="space-y-24">
            {/* ================ Hero ================= */}
            <section
                className="
          relative isolate h-screen w-screen
          left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]
          -mt-6 md:-mt-8
          overflow-hidden
        "
            >
                <div className="absolute inset-0 pointer-events-none z-0">
                    <Aurora amplitude={1.0} blend={0.6} speed={1.0} colorStops={auroraStops} />
                </div>
                <div className={`absolute inset-0 z-0 pointer-events-none ${overlayClass}`} />

                <div className="relative z-10 h-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 dark:bg-transparent border border-violet-500/20 backdrop-blur-sm animate-fade-in">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">Welcome to ModernBlog</span>
                    </div>

                    <h1 className={`text-5xl md:text-7xl font-bold leading-tight animate-slide-up ${headlineClass}`}>
                        Discover Stories That
                        <span className="block mt-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Inspire & Inform
            </span>
                    </h1>

                    <p className={`text-xl md:text-2xl leading-relaxed animate-slide-up ${subheadClass}`} style={{ animationDelay: '0.1s' }}>
                        Explore thoughtfully crafted articles on technology, design, and development from our community of talented writers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link
                            to="/read"
                            className="group px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl hover:shadow-2xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                            Start Reading
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/explore"
                            className={`px-8 py-4 rounded-xl font-bold text-lg border-2 hover:scale-105 transition-all duration-300
                ${isDark ? "border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)]" : "border-gray-300 bg-white/60 backdrop-blur hover:bg-white"}`}
                        >
                            Browse Topics
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto text-[var(--color-text-primary)] animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                {typeof readers === "string" ? readers : readers.toLocaleString()}
                            </div>
                            <div className={`text-sm font-medium ${isDark ? "text-[var(--color-text-tertiary)]" : "text-gray-600"}`}>Active Readers</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                {Number.isFinite(articlesCount) ? articlesCount : 0}
                            </div>
                            <div className={`text-sm font-medium ${isDark ? "text-[var(--color-text-tertiary)]" : "text-gray-600"}`}>Articles</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                {typeof writers === "string" ? writers : writers.toLocaleString()}
                            </div>
                            <div className={`text-sm font-medium ${isDark ? "text-[var(--color-text-tertiary)]" : "text-gray-600"}`}>Writers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================ Latest Articles ================= */}
            <section id="latest" className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">Latest Articles</h2>
                        <p className="text-lg text-[var(--color-text-secondary)]">Fresh perspectives from our community</p>
                    </div>

                    {latestPosts && latestPosts.length > slidesPerView && (
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                disabled={currentSlide >= maxSlide}
                                className="p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="aspect-[16/10] skeleton" />
                                <div className="p-6 space-y-4">
                                    <div className="h-6 w-3/4 skeleton rounded" />
                                    <div className="h-4 w-full skeleton rounded" />
                                    <div className="h-4 w-5/6 skeleton rounded" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {isError && (
                    <Card className="p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Failed to load posts</h3>
                            <p className="text-[var(--color-text-secondary)]">We couldn't fetch the posts. Please try again later.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 transition-all duration-200"
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
                                className="flex gap-6 transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView + 2)}%)` }}
                            >
                                {latestPosts.map((post, index) => (
                                    <div key={post.id} className="flex-shrink-0 w-full md:w-[calc(33.333%-16px)]">
                                        <Card hover className="overflow-hidden group h-full">
                                            <Link to={`/post/${post.slug}`} className="block">
                                                <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20">
                                                    {post.cover_image ? (
                                                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <BookOpen className="w-16 h-16 text-violet-300 dark:text-violet-700" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6 space-y-4">
                                                    <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20">
                              {getCategoryColor(index)}
                            </span>
                                                        <span className="text-sm flex items-center gap-1 text-[var(--color-text-tertiary)]">
                              <Clock className="w-4 h-4" />
                              5 min read
                            </span>
                                                    </div>

                                                    <h3 className="text-xl font-bold line-clamp-2 text-[var(--color-text-primary)] group-hover:text-violet-600 transition-colors">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-base line-clamp-2 leading-relaxed text-[var(--color-text-secondary)]">
                                                        {post.short_description}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Author</p>
                                                                <p className="text-xs text-[var(--color-text-tertiary)]">
                                                                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <ArrowRight className="w-5 h-5 text-violet-600 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {latestPosts.length > slidesPerView && (
                            <div className="flex md:hidden justify-center gap-2 mt-6">
                                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide
                                            ? 'w-8 bg-gradient-to-r from-violet-600 to-fuchsia-600'
                                            : 'w-2 bg-[var(--color-border-strong)]'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {latestPosts && latestPosts.length === 0 && (
                    <Card className="p-16 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-surface-elevated)]">
                                <BookOpen className="w-10 h-10 text-[var(--color-text-tertiary)]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-[var(--color-text-primary)]">No posts yet</h3>
                            <p className="text-[var(--color-text-secondary)]">Check back soon for new content!</p>
                        </div>
                    </Card>
                )}
            </section>

            {/* ================ Trending Now ================= */}
            <section className="grid md:grid-cols-2 gap-12">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-6 h-6 text-violet-600" />
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Trending Now</h2>
                    </div>

                    <div className="space-y-4">
                        {trendingPosts?.map((post, index) => (
                            <Link
                                key={post.id}
                                to={`/post/${post.slug}`}
                                className="group flex items-center gap-4 p-5 rounded-xl transition-all duration-200 hover:scale-[1.02] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-md"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl">
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-[var(--color-text-primary)] group-hover:text-violet-600 transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-tertiary)]">
                                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" />hot</span>
                                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />5 min read</span>
                                    </div>
                                </div>

                                <ArrowRight className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Newsletter/CTA (unchanged) */}
                <div className="rounded-2xl p-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
                    <div className="relative space-y-6">
                        <div className="inline-flex p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-bold">Stay in the Loop</h3>
                        <p className="text-white/90 text-lg leading-relaxed">Get the latest articles and insights delivered straight to your inbox every week.</p>
                        <div className="space-y-3 pt-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-5 py-4 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 placeholder-white/60 text-white font-medium focus:outline-none focus:border-white transition-all"
                            />
                            <button className="w-full px-6 py-4 rounded-xl bg-white text-violet-600 font-bold text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] shadow-lg">
                                Subscribe Now
                            </button>
                        </div>
                        <p className="text-white/70 text-sm">Join 50,000+ readers. Unsubscribe anytime.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
