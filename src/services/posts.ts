// src/services/posts.ts
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

/**
 * Proper paginated list with full filtering support:
 * - page: pagination
 * - q: trigram search query (searches across title, description, content, tags, author, etc.)
 * - ordering: sort order ("-published_at", "-created_at", "created_at", etc.)
 * - categoryName: filter by category name
 * - tags: comma-separated tag names/slugs for filtering
 */
export async function listClientPostsPaginated(params?: {
    page?: number;
    q?: string; // Changed from 'search' to 'q' to match backend
    ordering?: string;
    categoryName?: string;
    tags?: string; // Added tags parameter
}) {
    const { page = 1, q, ordering, categoryName, tags } = params || {};

    // Build query params - only include defined values
    const queryParams: Record<string, any> = { page };

    if (q) queryParams.q = q;
    if (ordering) queryParams.ordering = ordering;
    if (categoryName) queryParams.category = categoryName;
    if (tags) queryParams.tags = tags;

    const { data } = await api.get("posts/client/", {
        params: queryParams,
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
    const { data } = await api.get(`posts/client/${slug}/`, {
        withCredentials: true,
    });
    return data as PostDetail;
}

/** Related posts for a specific post */
export async function getRelatedPosts(slug: string) {
    const { data } = await api.get(`posts/client/${slug}/related-posts/`);
    return data as PostListItem[];
}

/**
 * Fetch posts filtered by specific tag IDs
 * Uses the dedicated tag endpoint for better performance
 */
export async function getPostsByTag(tagId: number) {
    const { data } = await api.get(`tags/${tagId}/posts/`);
    if (Array.isArray(data)) return data as PostListItem[];
    if (data?.results) return data.results as PostListItem[];
    return [];
}