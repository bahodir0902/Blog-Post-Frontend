import api from "../api/api";
import type {Tokens, User, VerifyResp} from "../types/auth";

export async function login(email: string, password: string, otp?: { token: string; code: string }) {
    const body: any = { email, password };
    if (otp?.token) body.otp_token = otp.token;
    if (otp?.code) body.otp_code = otp.code;
    const { data } = await api.post("accounts/login/", body);
    return data as { otp_required?: boolean; otp_token?: string } & Tokens;
}

export async function register(payload: {
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    re_password: string;
}) {
    const { data } = await api.post("accounts/auth/register/", payload);
    return data as { message: string; email: string; otp_token: string };
}

export async function verifyRegistration(payload: { otp_token?: string; code: string; email?: string }) {
    const { data } = await api.post("accounts/auth/verify-registration/", payload);
    return data as { message: string; user: User; tokens: Tokens };
}

export async function forgotPassword(payload: { email: string }) {
    const { data } = await api.post("accounts/auth/forgot-password/", payload);
    return data as { message: string; email: string; otp_token: string };
}

export async function verifyReset(payload: { otp_token: string; code: string }) {
    const { data } = await api.post("accounts/auth/verify-password-reset/", payload);
    return data as VerifyResp; // {message, uid, token}
}

export async function resetPassword(payload: { uid: string; token: string; new_password: string; re_new_password: string }) {
    const { data } = await api.post("accounts/auth/reset-password/", payload);
    return data as { message: string };
}

export const googleLogin = async (credential: string) => {
    const response = await api.post("/accounts/auth/google-login/", { credential });
    return response.data;
};
