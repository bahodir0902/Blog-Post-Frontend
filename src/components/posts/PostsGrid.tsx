import { Link } from "react-router-dom";
import Card from "../ui/Card";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import type { PostListItem } from "../../types/user";

export default function PostsGrid({ posts }: { posts: PostListItem[] }) {
    const getCategoryChip = (i: number) => ["Technology", "Design", "Development"][i % 3];

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, idx) => (
                <Card key={post.id} hover className="overflow-hidden group h-full">
                    <Link to={`/post/${post.slug}`} className="block h-full">
                        <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20">
                            {post.cover_image ? (
                                <img
                                    src={post.cover_image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-violet-300 dark:text-violet-700" />
                                </div>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20">
                  {getCategoryChip(idx)}
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
                                            {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-violet-600 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </Card>
            ))}
        </div>
    );
}
