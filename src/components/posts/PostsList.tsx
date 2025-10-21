import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import Card from "../ui/Card";

type Post = {
    id: number;
    title: string;
    description: string;
    slug: string;
    cover_image?: string;
    read_time: number;
    published_at: string;
    category?: {
        id: number;
        name: string;
        color?: string;
    };
    author?: {
        id: number;
        username: string;
        avatar?: string;
    };
};

interface PostsListProps {
    posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
    if (!posts.length) {
        return (
            <Card className="p-12 text-center">
                <p className="text-[var(--color-text-secondary)] text-lg">
                    No articles found. Try adjusting your filters.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <Link to={`/posts/${post.slug}`} className="flex flex-col sm:flex-row">
                        {/* Image */}
                        {post.cover_image && (
                            <div className="sm:w-64 sm:h-48 h-48 flex-shrink-0 overflow-hidden bg-[var(--color-surface-elevated)]">
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    {post.category && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-brand-500)] text-white">
                                            {post.category.name}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1.5 text-[var(--color-text-tertiary)] text-sm">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{post.read_time} min read</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 hover:text-[var(--color-brand-500)] transition-colors line-clamp-2">
                                    {post.title}
                                </h3>

                                <p className="text-[var(--color-text-secondary)] text-sm line-clamp-2 mb-4">
                                    {post.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                {post.author && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {post.author.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-medium text-[var(--color-text-primary)]">
                                                {post.author.username}
                                            </div>
                                            <div className="text-xs text-[var(--color-text-tertiary)]">
                                                {new Date(post.published_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-[var(--color-brand-500)] font-medium text-sm">
                                    Read more
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </Card>
            ))}
        </div>
    );
}