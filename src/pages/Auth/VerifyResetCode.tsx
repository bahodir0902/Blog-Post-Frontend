import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setOk(null);

        if (p1 !== p2) {
            setErr("Passwords do not match");
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
                re_new_password: p2,
            });
            setOk(r.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                "Password reset failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
            <div className="w-full max-w-md animate-scale-in">
                <Card>
                    <div className="p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] mb-2">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                                    Set New Password
                                </h2>
                                <p className="mt-2 text-[var(--color-text-secondary)]">
                                    Choose a strong password for your account
                                </p>
                            </div>
                        </div>

                        {/* Success Message */}
                        {ok && (
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
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
                                    placeholder="••••••••"
                                    required
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
                                <Label htmlFor="confirmPassword" required>
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={p2}
                                    onChange={(e) => setP2(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={loading}
                                disabled={!!ok}
                            >
                                {loading ? "Resetting password..." : "Reset Password"}
                            </Button>
                        </form>

                        {/* Password Requirements */}
                        <div className="pt-6 border-t border-[var(--color-border)]">
                            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                                Password Requirements
                            </h4>
                            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                                <li className="flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${p1.length >= 8 ? "text-green-500" : "text-[var(--color-text-tertiary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    At least 8 characters
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${/[A-Z]/.test(p1) ? "text-green-500" : "text-[var(--color-text-tertiary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    One uppercase letter
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${/[0-9]/.test(p1) ? "text-green-500" : "text-[var(--color-text-tertiary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    One number
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className={`w-4 h-4 ${p1 && p2 && p1 === p2 ? "text-green-500" : "text-[var(--color-text-tertiary)]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Passwords match
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}