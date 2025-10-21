// src/hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../services/user";

export function useCurrentUser() {
    const q = useQuery({
        queryKey: ["me", "profile"],
        queryFn: getProfile,
        staleTime: 5 * 60 * 1000,
    });

    const me = q.data;
    const role = me?.user?.role as string | undefined;
    const groups = (me?.user?.groups ?? []) as string[];

    const canWrite =
        role === "author" ||
        role === "admin" ||
        groups.includes("author") ||
        groups.includes("admin");

    return { ...q, me, role, groups, canWrite };
}
