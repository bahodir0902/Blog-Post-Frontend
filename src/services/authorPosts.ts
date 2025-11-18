// src/services/authorPosts.ts
import api from "../api/api";

export type AuthorPostListItem = {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
    status?: "draft" | "published" | "scheduled" | "archived";
};

export type AuthorPostDetail = {
    id: number;
    title: string;
    slug: string;
    category: number | null;
    short_description: string;
    content: any; // Editor.js JSON
    cover_image: string | null;
    author: number;
    status: "draft" | "published" | "scheduled" | "archived";
    published_at?: string | null;
    created_at: string;
    updated_at: string;
};

export type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export async function createAuthorPost(payload: {
    title: string;
    category?: number | null;
    short_description: string;
    content: any;
    status: "draft" | "published" | "scheduled" | "archived";
    published_at?: string;
    cover_image?: File | null;
}) {
    const fd = new FormData();
    fd.append("title", payload.title);
    if (payload.category) fd.append("category", String(payload.category));
    fd.append("short_description", payload.short_description);
    fd.append("content", JSON.stringify(payload.content ?? {}));
    fd.append("status", payload.status);
    if (payload.published_at) fd.append("published_at", payload.published_at);
    if (payload.cover_image) fd.append("cover_image", payload.cover_image);

    const { data } = await api.post("posts/author/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as AuthorPostDetail;
}

export async function updateAuthorPost(
    slug: string,
    payload: Partial<{
        title: string;
        category: number | null;
        short_description: string;
        content: any;
        status: "draft" | "published" | "scheduled" | "archived";
        published_at: string;
        cover_image: File | null; // send only when changed
    }>
) {
    const fd = new FormData();
    if (payload.title !== undefined) fd.append("title", payload.title);
    if (payload.category !== undefined && payload.category !== null)
        fd.append("category", String(payload.category));
    if (payload.category === null) fd.append("category", "");
    if (payload.short_description !== undefined)
        fd.append("short_description", payload.short_description);
    if (payload.content !== undefined)
        fd.append("content", JSON.stringify(payload.content ?? {}));
    if (payload.status !== undefined) fd.append("status", payload.status);
    if (payload.published_at !== undefined) fd.append("published_at", payload.published_at);
    if (payload.cover_image) fd.append("cover_image", payload.cover_image);

    const { data } = await api.patch(`posts/author/${slug}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as AuthorPostDetail;
}

export async function deleteAuthorPost(slug: string) {
    await api.delete(`posts/author/${slug}/`);
}

export async function getMyPosts(page = 1) {
    const { data } = await api.get("posts/author/my-posts", { params: { page } });
    if (Array.isArray(data)) {
        return {
            count: data.length,
            next: null,
            previous: null,
            results: data,
        } as Paginated<AuthorPostListItem>;
    }
    return data as Paginated<AuthorPostListItem>;
}

export async function getAuthorPost(slug: string) {
    const { data } = await api.get(`posts/author/${slug}/`);
    return data as AuthorPostDetail;
}

export async function uploadTempPostImage(file: File) {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post("posts/author/upload-temp-image/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { id: number; url: string };
}

export async function uploadPostImage(slug: string, file: File) {
    const fd = new FormData();
    fd.append("image", file);
    const { data } = await api.post(`posts/author/${slug}/images/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { id: number; url: string };
}

export async function adoptImages(slug: string, imageIds: number[]) {
    const { data } = await api.post(`posts/author/${slug}/adopt-images/`, { image_ids: imageIds });
    return data as { attached: number };
}