export type Tag = {
    id: number;
    name: string;
    slug: string;
    created_at: string;
};

export type TagCreate = {
    name: string;
    slug: string;
};