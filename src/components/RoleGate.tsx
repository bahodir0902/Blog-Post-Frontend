// src/components/RoleGate.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function RoleGate({
                             children,
                             writerOnly = false,
                         }: {
    children: React.ReactNode;
    writerOnly?: boolean;
}) {
    const { accessToken } = useAuth();
    const { canWrite, isLoading } = useCurrentUser();

    if (!accessToken) return <Navigate to="/login" replace />;

    if (!writerOnly) return <>{children}</>;

    if (isLoading) {
        return (
            <div className="container-responsive py-16">
                <div className="mx-auto h-10 w-10 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-brand-500)] animate-spin" />
            </div>
        );
    }

    if (!canWrite) {
        return (
            <div className="container-responsive py-16 text-left">
                <div className="card p-8">
                    <h1 className="text-2xl font-bold mb-2">403 — Not allowed</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        You don’t have permission to write posts. If this is a mistake, please contact an
                        administrator.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
