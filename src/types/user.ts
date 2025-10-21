export type ProfileRead = {
    user: {
        id: number;
        first_name: string;
        last_name: string | null;
        email: string;
        mfa_enabled: boolean;
        date_joined: string;
        last_login: string | null;
        role: string;
        groups: string[];
        status: string;
        profile_photo?: string | null;
    };
    middle_name: string | null;
    birth_date: string | null;
    phone_number: string | null;
    profile_photo: string | null;
    updated_at: string;
};

export type ProfileWrite = Partial<{
    "user.first_name": string;
    "user.last_name": string;
    "user.mfa_enabled": boolean;
    birth_date: string;            // YYYY-MM-DD
    phone_number: string;
    middle_name: string;
    profile_photo: File | null;
}>;

export type PostListItem = {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
};

export type PostDetail = {
    id: number;
    title: string;
    slug: string;
    category: number | null;
    short_description: string;
    content: any;
    cover_image: string | null;
    author: number;
    status: string;
    created_at: string;
    updated_at: string;
};
