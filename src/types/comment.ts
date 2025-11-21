// src/types/comment.ts

export type CommentAuthor = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
};

export type Comment = {
    id: number;
    post: number;
    author: CommentAuthor | null;
    parent: number | null;
    content: string;
    is_edited: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    reply_count?: number;
    likes?: number;
    dislikes?: number;
    user_reaction?: "LIKE" | "DISLIKE" | null;  // NEW
};

export type CommentCreate = {
    parent?: number | null;
    content: string;
};

export type CommentUpdate = {
    content: string;
};