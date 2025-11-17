// src/pages/Auth/ForgotPassword.tsx
import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { forgotPassword } from "../../services/auth";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await forgotPassword({ email });
            navigate("/forgot-password/verify", {
                state: { email: res.email, otp_token: res.otp_token },
            });
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                "Failed to send reset code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

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
                                        Forgot Password?
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        No worries, we'll send you reset instructions
                                    </p>
                                </div>
                            </div>

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
                                    <Label htmlFor="email" required>
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                        autoComplete="email"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        }
                                    />
                                </div>

                                <Button type="submit" className="w-full" isLoading={loading}>
                                    Send Reset Code
                                </Button>
                            </form>

                            {/* Back to Login */}
                            <div className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--color-border)]">
                                <svg className="w-4 h-4 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] dark:hover:text-[var(--color-brand-400)] transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}