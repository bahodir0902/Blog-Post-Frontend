export type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export type HomeStats = {
    "Active Readers": string | number;
    "Articles": string | number;
    "Writers": string | number;
};
