// src/services/favourites.ts
import api from "../api/api";
import type { PostListItem } from "../types/user";

export interface FavouriteItem {
    id: number;
    user: number;
    post: PostListItem;
    created_at: string;
    updated_at: string;
}

export interface BookmarkItem {
    id: number;
    user: number;
    post: PostListItem;
    created_at: string;
    updated_at: string;
}

export async function listFavourites() {
    const { data } = await api.get("favourites/");
    return data as FavouriteItem[];
}

export async function listBookmarks() {
    const { data } = await api.get("bookmarks/");
    return data as BookmarkItem[];
}

export async function addFavourite(slug: string) {
    const { data } = await api.post(`posts/client/${slug}/favourite/`);
    return data;
}

export async function removeFavourite(slug: string) {
    const { data } = await api.delete(`posts/client/${slug}/favourite/`);
    return data;
}

export async function addBookmark(slug: string) {
    const { data } = await api.post(`posts/client/${slug}/bookmark/`);
    return data;
}

export async function removeBookmark(slug: string) {
    const { data } = await api.delete(`posts/client/${slug}/bookmark/`);
    return data;
}