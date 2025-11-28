// src/services/tags.ts
import api from "../api/api";
import type { Tag, TagCreate } from "../types/tag";

export async function listTags() {
    const { data } = await api.get("tags/");
    return data as Tag[];
}

export async function getTag(id: number) {
    const { data } = await api.get(`tags/${id}/`);
    return data as Tag;
}

export async function createTag(payload: TagCreate) {
    const { data } = await api.post("tags/", payload);
    return data as Tag;
}

export async function updateTag(id: number, payload: Partial<TagCreate>) {
    const { data } = await api.patch(`tags/${id}/`, payload);
    return data as Tag;
}

export async function deleteTag(id: number) {
    await api.delete(`tags/${id}/`);
}

export async function getPostTags(slug: string) {
    const { data } = await api.get(`posts/client/${slug}/tags/`);
    return data as Tag[];
}