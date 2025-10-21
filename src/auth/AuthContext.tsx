// src/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/api";

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string, otp?: { token: string; code: string }) => Promise<{
        success: boolean;
        otpRequired?: boolean;
        otpToken?: string;
    }>;
    setTokens: (access: string, refresh: string) => void; // <— added
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

type JwtPayload = { exp?: number };

const ENV_REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL_MS);
const ENV_SKEW_MS = Number(import.meta.env.VITE_REFRESH_SKEW_MS);

const DEFAULT_REFRESH_INTERVAL_MS = 4 * 60 * 1000;
const DEFAULT_SKEW_MS = 60 * 1000;
const MIN_DELAY_MS = 10_000;

const REFRESH_INTERVAL_MS =
    Number.isFinite(ENV_REFRESH_INTERVAL_MS) && ENV_REFRESH_INTERVAL_MS > 0
        ? ENV_REFRESH_INTERVAL_MS
        : DEFAULT_REFRESH_INTERVAL_MS;

const REFRESH_SKEW_MS =
    Number.isFinite(ENV_SKEW_MS) && ENV_SKEW_MS >= 0 ? ENV_SKEW_MS : DEFAULT_SKEW_MS;

// ---- JWT utils ----
function parseJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
        return null;
    }
}
function msUntilAccessExpiry(access: string | null): number | null {
    if (!access) return null;
    const payload = parseJwt(access);
    if (!payload?.exp) return null;
    const expiresAtMs = payload.exp * 1000;
    const diff = expiresAtMs - Date.now();
    return diff > 0 ? diff : 0;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("access"));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refresh"));
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const saveTokens = (access: string, refresh: string) => {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
    };

    // <— PUBLIC setter for SSO / Google callback / register flow
    const setTokens = (access: string, refresh: string) => {
        saveTokens(access, refresh);
    };

    const login = async (
        email: string,
        password: string,
        otp?: { token: string; code: string }
    ) => {
        const body: Record<string, string> = { email, password };
        if (otp?.token) body.otp_token = otp.token;
        if (otp?.code) body.otp_code = otp.code;

        try {
            const res = await api.post("accounts/login/", body);

            if (res.data.otp_required) {
                return { success: true, otpRequired: true, otpToken: res.data.otp_token as string };
            }
            saveTokens(res.data.access, res.data.refresh);
            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (accessToken && refreshToken) {
                await api.delete("accounts/auth/logout/", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    data: { refresh_token: refreshToken },
                    withCredentials: true,
                });
            }
        } catch (err) {
            console.warn("Server logout failed:", err);
        } finally {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setAccessToken(null);
            setRefreshToken(null);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            window.location.href = "/login";
        }
    };

    // Auto-refresh loop
    useEffect(() => {
        if (!refreshToken) return;

        let mounted = true;
        const scheduleNext = (suggestedMs?: number) => {
            if (!mounted) return;
            if (timerRef.current) clearTimeout(timerRef.current);
            const msLeft = msUntilAccessExpiry(localStorage.getItem("access"));
            const delay =
                msLeft !== null ? Math.max(MIN_DELAY_MS, msLeft - REFRESH_SKEW_MS) : (suggestedMs || REFRESH_INTERVAL_MS);
            timerRef.current = setTimeout(refreshOnce, delay);
        };

        const refreshOnce = async () => {
            try {
                const res = await api.post("accounts/login/refresh/", { refresh: refreshToken });
                const newAccess = res.data.access as string;
                localStorage.setItem("access", newAccess);
                setAccessToken(newAccess);
                if (res.data.refresh) {
                    const newRefresh = res.data.refresh as string;
                    saveTokens(newAccess, newRefresh);
                }
            } catch (err) {
                console.error("Token refresh failed:", err);
                await logout();
                return;
            }
            scheduleNext(REFRESH_INTERVAL_MS);
        };

        scheduleNext(REFRESH_INTERVAL_MS);

        return () => {
            mounted = false;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [refreshToken]);

    return (
        <AuthContext.Provider value={{ accessToken, refreshToken, login, setTokens, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
