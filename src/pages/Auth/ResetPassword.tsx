// src/pages/Auth/ResetPassword.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { resetPassword } from "../../services/auth";

export default function ResetPassword() {
    const { state } = useLocation() as { state?: { uid: string; token: string } };
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!state?.uid || !state?.token) {
            navigate("/forgot-password", { replace: true });
        }
    }, [state, navigate]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setOk(null);

        if (p1 !== p2) {
            setErr("Passwords don't match");
            return;
        }

        if (p1.length < 8) {
            setErr("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);
        try {
            const r = await resetPassword({
                uid: state?.uid!,
                token: state?.token!,
                new_password: p1,
                re_new_password: p2
            });
            setOk(r.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                "Reset failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!state?.uid || !state?.token) return null;

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-md">
                <div className="animate-slide-up">
                    <Card className="backdrop-blur-xl">
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                                        Set New Password
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Choose a strong password for your account
                                    </p>
                                </div>
                            </div>

                            {/* Success Message */}
                            {ok && (
                                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 animate-fade-in">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">{ok}</p>
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Redirecting to login...</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {err && (
                                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 animate-fade-in">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">{err}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={onSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password" required>
                                        New Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={p1}
                                        onChange={(e) => setP1(e.target.value)}
                                        placeholder="Create a strong password"
                                        required
                                        autoComplete="new-password"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        }
                                    />
                                    <p className="text-xs text-[var(--color-text-tertiary)]">
                                        Must be at least 8 characters
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password" required>
                                        Confirm New Password
                                    </Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={p2}
                                        onChange={(e) => setP2(e.target.value)}
                                        placeholder="Confirm your password"
                                        required
                                        autoComplete="new-password"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        }
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full mt-6"
                                    isLoading={loading}
                                    disabled={!!ok}
                                >
                                    Reset Password
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}