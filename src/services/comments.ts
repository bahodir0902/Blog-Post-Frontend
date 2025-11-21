// src/services/comments.ts

import api from "../api/api";
import type { Comment, CommentCreate, CommentUpdate } from "../types/comment";
import type { Paginated } from "../types/api";

/**
 * List top-level comments for a specific post with pagination and ordering
 */
export async function listComments(
    postSlug: string,
    params?: {
        page?: number;
        page_size?: number;
        ordering?: string;
    }
) {
    const { page = 1, page_size = 10, ordering = "-created_at" } = params || {};
    const { data } = await api.get(`posts/client/${postSlug}/comments/`, {
        params: { page, page_size, ordering },
    });
    return data as Paginated<Comment>;
}

/**
 * Fetch replies for a specific comment (lazy loading)
 */
export async function fetchReplies(postSlug: string, commentId: number) {
    const { data } = await api.get(
        `posts/client/${postSlug}/comments/${commentId}/view-replies/`
    );
    return data as Comment[];
}

/**
 * Create a new comment or reply
 */
export async function createComment(postSlug: string, body: CommentCreate) {
    const { data } = await api.post(`posts/client/${postSlug}/comments/`, body);
    return data as Comment;
}

/**
 * Update an existing comment
 */
export async function updateComment(
    postSlug: string,
    commentId: number,
    body: CommentUpdate
) {
    const { data } = await api.patch(
        `posts/client/${postSlug}/comments/${commentId}/`,
        body
    );
    return data as Comment;
}

/**
 * Delete a comment
 */
export async function deleteComment(postSlug: string, commentId: number) {
    await api.delete(`posts/client/${postSlug}/comments/${commentId}/`);
}

/**
 * Like a comment (toggle)
 */
export async function likeComment(postSlug: string, commentId: number) {
    const { data } = await api.post(
        `posts/client/${postSlug}/comments/${commentId}/like/`
    );
    return data;
}

/**
 * Dislike a comment (toggle)
 */
export async function dislikeComment(postSlug: string, commentId: number) {
    const { data } = await api.post(
        `posts/client/${postSlug}/comments/${commentId}/dislike/`
    );
    return data;
}