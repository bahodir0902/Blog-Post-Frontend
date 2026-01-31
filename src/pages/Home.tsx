// src/pages/Home.tsx - Complete Structural Redesign with Live Animations
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Clock,
    BookOpen,
    ArrowRight,
    Sparkles,
    Users,
    FileText,
    Zap,
    Play,
    Pause,
    Eye,
    Heart,
    Flame,
    Star,
    ArrowUpRight
} from "lucide-react";
import Card from "../components/ui/Card";
import { getLatestPosts, getTrendingPosts, getHomeStats } from "../services/posts";

// ============ LIVE TRENDING CAROUSEL ============
function TrendingCarousel({ posts }: { posts: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const SLIDE_DURATION = 5000; // 5 seconds per slide
    const PROGRESS_INTERVAL = 50; // Update progress every 50ms

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setProgress(0);
    }, [posts.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
        setProgress(0);
    }, [posts.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setProgress(0);
    };

    // Auto-play logic
    useEffect(() => {
        if (isPlaying && posts.length > 1) {
            intervalRef.current = setInterval(nextSlide, SLIDE_DURATION);
            progressRef.current = setInterval(() => {
                setProgress((prev) => Math.min(prev + (100 / (SLIDE_DURATION / PROGRESS_INTERVAL)), 100));
            }, PROGRESS_INTERVAL);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [isPlaying, posts.length, nextSlide]);

    // Reset progress when slide changes
    useEffect(() => {
        setProgress(0);
    }, [currentIndex]);

    if (!posts.length) return null;

    return (
        <div className="relative group">
            {/* Main Carousel Container */}
            <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden">
                {/* Slides */}
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        className={`absolute inset-0 transition-all duration-700 ease-out ${
                            index === currentIndex
                                ? 'opacity-100 scale-100 z-10'
                                : index === (currentIndex - 1 + posts.length) % posts.length
                                    ? 'opacity-0 scale-105 -translate-x-full z-0'
                                    : 'opacity-0 scale-95 translate-x-full z-0'
                        }`}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            {post.cover_image ? (
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-brand-400)]" />
                            )}
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-end p-8 md:p-12 lg:p-16">
                            <div className="max-w-3xl space-y-6">
                                {/* Trending Badge */}
                                <div className="flex items-center gap-3 animate-slide-up">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-accent-gold)] to-orange-500 text-white text-sm font-bold shadow-lg">
                                        <Flame className="w-4 h-4 animate-pulse" />
                                        Trending #{index + 1}
                                    </span>
                                    <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium">
                                        {post.read_time || 5} min read
                                    </span>
                                </div>

                                {/* Title */}
                                <Link to={`/post/${post.slug}`}>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight hover:text-[var(--color-brand-300)] transition-colors animate-slide-up-delay-1">
                                        {post.title}
                                    </h2>
                                </Link>

                                {/* Description */}
                                <p className="text-lg md:text-xl text-white/80 leading-relaxed line-clamp-2 animate-slide-up-delay-2">
                                    {post.short_description}
                                </p>

                                {/* Meta & CTA */}
                                <div className="flex flex-wrap items-center gap-6 animate-slide-up-delay-3">
                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30">
                                            {post.author?.first_name?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">
                                                {post.author?.full_name || post.author?.first_name || 'Author'}
                                            </p>
                                            <p className="text-white/60 text-sm">
                                                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Read Button */}
                                    <Link
                                        to={`/post/${post.slug}`}
                                        className="group/btn inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-semibold hover:bg-[var(--color-brand-400)] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                                    >
                                        Read Article
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <div className="flex items-center justify-between gap-4">
                    {/* Progress Indicators */}
                    <div className="flex items-center gap-2 flex-1">
                        {posts.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className="relative flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden cursor-pointer hover:bg-white/40 transition-colors"
                            >
                                <div
                                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-100 ${
                                        index === currentIndex
                                            ? 'bg-[var(--color-brand-400)]'
                                            : index < currentIndex
                                                ? 'bg-white/60 w-full'
                                                : 'bg-transparent w-0'
                                    }`}
                                    style={{
                                        width: index === currentIndex ? `${progress}%` : index < currentIndex ? '100%' : '0%'
                                    }}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        {/* Play/Pause */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>

                        {/* Prev/Next */}
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Slide Counter */}
            <div className="absolute top-6 right-6 z-20">
                <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white font-mono text-sm">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(posts.length).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
}

// ============ FEATURED POST CARD ============
function FeaturedPostCard({ post, index }: { post: any; index: number }) {
    return (
        <Link
            to={`/post/${post.slug}`}
            className="group relative block overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                {post.cover_image ? (
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)] dark:from-[var(--color-brand-800)] dark:to-[var(--color-brand-900)] flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-[var(--color-brand-400)]" />
                    </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Read more indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="px-6 py-3 rounded-full bg-white/90 text-gray-900 font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Read Article
                        <ArrowUpRight className="w-4 h-4" />
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-500)]/20 dark:text-[var(--color-brand-400)]">
                        Article
                    </span>
                    <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time || 5} min
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors line-clamp-2 mb-3">
                    {post.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4">
                    {post.short_description}
                </p>

                {/* Author & Date */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white text-xs font-bold">
                            {post.author?.first_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {post.author?.first_name || 'Author'}
                        </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ============ QUICK TRENDING LIST ============
function QuickTrendingList({ posts }: { posts: any[] }) {
    return (
        <div className="space-y-4">
            {posts.slice(0, 5).map((post, index) => (
                <Link
                    key={post.id}
                    to={`/post/${post.slug}`}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] hover:shadow-lg transition-all duration-300"
                >
                    {/* Rank Number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-600)] transition-colors line-clamp-2 mb-2">
                            {post.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {post.views_unique || Math.floor(Math.random() * 1000) + 100}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {Math.floor(Math.random() * 100) + 10}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.read_time || 5} min
                            </span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-500)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </Link>
            ))}
        </div>
    );
}

// ============ MAIN HOME COMPONENT ============
export default function Home() {
    const { data: latestPosts, isLoading: latestLoading } = useQuery({
        queryKey: ["latest_posts"],
        queryFn: getLatestPosts,
    });

    const { data: trendingPosts, isLoading: trendingLoading } = useQuery({
        queryKey: ["trending_posts"],
        queryFn: getTrendingPosts,
    });

    const { data: stats } = useQuery({
        queryKey: ["home_stats"],
        queryFn: getHomeStats,
    });

    const articlesCount = Number(stats?.["Articles"] ?? 0);
    const readers = stats?.["Active Readers"] ?? "50K+";
    const writers = stats?.["Writers"] ?? "100+";

    const statItems = [
        { label: "Active Readers", value: typeof readers === "string" ? readers : readers.toLocaleString(), icon: Users, color: "from-blue-500 to-cyan-500" },
        { label: "Articles Published", value: Number.isFinite(articlesCount) ? articlesCount.toLocaleString() : "0", icon: FileText, color: "from-[var(--color-brand-500)] to-emerald-500" },
        { label: "Expert Writers", value: typeof writers === "string" ? writers : writers.toLocaleString(), icon: Star, color: "from-amber-500 to-orange-500" },
    ];

    return (
        <div className="space-y-16 md:space-y-24">
            {/* ============ HERO WITH LIVE TRENDING CAROUSEL ============ */}
            <section className="container-responsive">
                {trendingLoading ? (
                    <div className="h-[500px] md:h-[600px] rounded-3xl skeleton" />
                ) : trendingPosts && trendingPosts.length > 0 ? (
                    <TrendingCarousel posts={trendingPosts.slice(0, 5)} />
                ) : (
                    /* Fallback Hero if no trending posts */
                    <div className="relative h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-brand-400)]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-6 max-w-2xl px-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                                    <Sparkles className="w-4 h-4" />
                                    Welcome to ModernBlog
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-white">
                                    Discover Stories That Inspire
                                </h1>
                                <p className="text-xl text-white/80">
                                    Explore thoughtfully crafted articles from our community of talented writers.
                                </p>
                                <Link
                                    to="/read"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-gray-900 font-semibold hover:scale-105 transition-transform"
                                >
                                    Start Reading
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ============ STATS BAR ============ */}
            <section className="container-responsive">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statItems.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                {/* Background gradient on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                                
                                <div className="relative flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ============ LATEST ARTICLES + TRENDING SIDEBAR ============ */}
            <section className="container-responsive">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Latest Articles - 2 columns */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] shadow-lg">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">Latest Articles</h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Fresh from our community</p>
                                </div>
                            </div>
                            <Link
                                to="/read"
                                className="group flex items-center gap-2 text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] font-semibold transition-colors"
                            >
                                View All
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {latestLoading ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
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
                        ) : latestPosts && latestPosts.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {latestPosts.slice(0, 4).map((post, index) => (
                                    <FeaturedPostCard key={post.id} post={post} index={index} />
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-[var(--color-text-tertiary)] mb-4" />
                                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">No posts yet</h3>
                                <p className="text-[var(--color-text-secondary)]">Check back soon!</p>
                            </Card>
                        )}
                    </div>

                    {/* Trending Sidebar */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Trending Now</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">Most popular today</p>
                            </div>
                        </div>

                        {trendingLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-[var(--color-border)]">
                                        <div className="w-12 h-12 skeleton rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-full skeleton rounded" />
                                            <div className="h-3 w-1/2 skeleton rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : trendingPosts && trendingPosts.length > 0 ? (
                            <QuickTrendingList posts={trendingPosts} />
                        ) : null}
                    </div>
                </div>
            </section>

            {/* ============ NEWSLETTER CTA ============ */}
            <section className="container-responsive">
                <div className="relative rounded-3xl p-8 md:p-12 lg:p-16 bg-gradient-to-br from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-brand-400)] overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 blur-2xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                            {/* Grid pattern */}
                            <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                                <Sparkles className="w-4 h-4" />
                                <span className="font-medium">Join 50,000+ readers</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                Get the best stories delivered to your inbox
                            </h2>
                            <p className="text-lg text-white/80">
                                Weekly digest of our top articles, hand-picked just for you. No spam, ever.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-6 py-5 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all text-lg"
                                />
                            </div>
                            <button className="w-full px-8 py-5 rounded-2xl bg-white text-[var(--color-brand-600)] font-bold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]">
                                Subscribe Now
                            </button>
                            <p className="text-white/60 text-sm text-center">
                                Unsubscribe anytime. We respect your privacy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ EXPLORE CTA ============ */}
            <section className="container-responsive pb-8">
                <div className="text-center space-y-6 py-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                        Ready to discover more?
                    </h2>
                    <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
                        Browse our complete collection of articles across all topics.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/read"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-lg hover:shadow-xl hover:shadow-[var(--color-brand-500)]/25 transition-all hover:-translate-y-1"
                        >
                            Browse All Articles
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)] text-[var(--color-text-primary)] transition-all hover:-translate-y-1"
                        >
                            Explore Topics
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
