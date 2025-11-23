// src/services/reactions.ts
import api from "../api/api";
import type { ReactionType, PostReaction, PutReactionPayload } from "../types/reactions";

/**
 * Get all available reaction types (for authors when creating/editing posts)
 */
export async function listAvailableReactions(): Promise<ReactionType[]> {
    const { data } = await api.get("posts/author/list-available-reactions/");
    return data as ReactionType[];
}

/**
 * Get reactions for a specific post (with counts and user's reaction)
 * Now properly filtered by backend to only show allowed reactions
 */
export async function listPostReactions(slug: string): Promise<PostReaction[]> {
    const { data } = await api.get(`posts/client/${slug}/list-reactions/`);
    return data as PostReaction[];
}

/**
 * Put/update a reaction on a post
 * Returns updated reactions list with counts
 */
export async function putReaction(slug: string, payload: PutReactionPayload): Promise<PostReaction[]> {
    const { data } = await api.post(`posts/client/${slug}/put-reaction/`, payload);
    return data as PostReaction[];
}

/**
 * Remove user's reaction from a post
 * Returns updated reactions list with counts
 */
export async function removeReaction(slug: string): Promise<PostReaction[]> {
    const { data } = await api.delete(`posts/client/${slug}/put-reaction/`);
    return data as PostReaction[];
}