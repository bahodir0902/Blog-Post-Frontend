import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { getProfile } from "../services/user";

export function useCurrentUser() {
    const { accessToken } = useAuth();

    const q = useQuery({
        queryKey: ["me", "profile"],
        queryFn: getProfile,
        staleTime: 5 * 60 * 1000,
        retry: false,
        // Only fetch if we have an access token
        enabled: !!accessToken,
    });

    const me = q.data;
    const user = me?.user || null;
    const role = me?.user?.role as string | undefined;
    const groups = (me?.user?.groups ?? []) as string[];

    const canWrite =
        role === "author" ||
        role === "admin" ||
        role === "Writer" ||
        role === "Admin" ||
        groups.includes("author") ||
        groups.includes("admin") ||
        groups.includes("Writer") ||
        groups.includes("Admin");

    const isAdmin = role === "admin" || role === "Admin" || groups.includes("admin") || groups.includes("Admin");

    return {
        ...q,
        me,
        user,
        role,
        groups,
        canWrite,
        isAdmin,
        isLoading: accessToken ? q.isLoading : false,
        error: accessToken ? q.error : null,
    };
}