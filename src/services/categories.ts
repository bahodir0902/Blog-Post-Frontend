import api from "../api/api";
import type { Paginated } from "../types/api";
import type { PostListItem } from "../types/user";

export type Category = {
    id: number;
    name: string;
    description?: string | null;
};

/**
 * Handles both plain arrays and DRF-paginated category responses.
 */
export async function listCategories(): Promise<Category[]> {
    const { data } = await api.get("category/");
    if (Array.isArray(data)) return data as Category[];
    if (data && Array.isArray(data.results)) return data.results as Category[];
    return [];
}

export async function listCategoryPosts(categoryId: number, params?: { page?: number }) {
    const { page = 1 } = params || {};
    const { data } = await api.get(`category/${categoryId}/posts/`, { params: { page } });
    return data as Paginated<PostListItem>;
}
