export type Tokens = { access?: string; refresh?: string };
export type User = {
    id: number;
    first_name: string;
    last_name: string | null;
    email: string;
    mfa_enabled: boolean;
    date_joined: string;
    last_login: string | null;
    role: string;
    groups: string[];
    status: "Authorized" | "Unauthorized" | "Deactivated";
    profile_photo?: string | null;
};
export type VerifyResp = { message: string; uid: string; token: string };
