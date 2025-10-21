import api from "../api/api";
import type { PostListItem, PostDetail } from "../types/user";
import type { Paginated, HomeStats } from "../types/api";

/**
 * Old function kept for backward-compat. If server is paginated,
 * this will unwrap .results. Otherwise returns the array directly.
 */
export async function listPosts(): Promise<PostListItem[]> {
    const { data } = await api.get("posts/client/");
    if (Array.isArray(data)) return data as PostListItem[];
    if (data?.results) return data.results as PostListItem[];
    return [];
}

/** Proper paginated list for new pages */
export async function listClientPostsPaginated(params?: {
    page?: number;
    search?: string;
    ordering?: string; // "-published_at", "-created_at", "created_at", etc
    categoryName?: string; // filterset: category__name
}) {
    const { page = 1, search, ordering, categoryName } = params || {};
    const { data } = await api.get("posts/client/", {
        params: {
            page,
            search,
            ordering,
            ...(categoryName ? { "category__name": categoryName } : {}),
        },
    });
    return data as Paginated<PostListItem>;
}

/** Home feeds (10 items each, non-paginated by design) */
export async function getLatestPosts() {
    const { data } = await api.get("posts/client/latest-posts/");
    return data as PostListItem[];
}

export async function getTrendingPosts() {
    const { data } = await api.get("posts/client/trending-posts/");
    return data as PostListItem[];
}

export async function getMostPopularPosts() {
    const { data } = await api.get("posts/client/most-popular-posts/");
    return data as PostListItem[];
}

/** Home stats */
export async function getHomeStats() {
    const { data } = await api.get("posts/client/homepage-statistics/");
    return data as HomeStats;
}

export async function getPost(slug: string) {
    const { data } = await api.get(`posts/client/${slug}/`);
    return data as PostDetail;
}
