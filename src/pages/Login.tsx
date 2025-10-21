import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { googleLoginUrl } from "../services/auth";
import Card from "../components/ui/Card";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OtpInput from "../components/ui/OtpInput";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpToken, setOtpToken] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await login(
                email,
                password,
                otpToken && otp ? { token: otpToken, code: otp } : undefined
            );

            if (res.otpRequired && res.otpToken) {
                setOtpToken(res.otpToken);
            } else {
                navigate("/");
            }
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                e?.response?.data?.non_field_errors?.[0] ||
                "Login failed. Please check your credentials."
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
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                                Welcome Back
                            </h2>
                            <p className="text-[var(--color-text-secondary)]">
                                Sign in to continue to your account
                            </p>
                        </div>

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

                        {/* OTP Stage */}
                        {otpToken ? (
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)] text-[var(--color-brand-600)]">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                            Two-Factor Authentication
                                        </h3>
                                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                                            Enter the 6-digit code sent to your email
                                        </p>
                                    </div>
                                </div>

                                <OtpInput value={otp} onChange={setOtp} length={6} autoFocus />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={loading}
                                    disabled={otp.length < 6}
                                >
                                    {loading ? "Verifying..." : "Verify & Continue"}
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpToken(null);
                                        setOtp("");
                                    }}
                                    className="w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-500)] transition-colors"
                                >
                                    Back to login
                                </button>
                            </form>
                        ) : (
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
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" required>
                                            Password
                                        </Label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm font-medium text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
                                        >
                                            Forgot?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        }
                                    />
                                </div>

                                <Button type="submit" className="w-full" isLoading={loading}>
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>
                        )}

                        {/* Divider */}
                        {!otpToken && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-[var(--color-border)]" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[var(--color-surface)] text-[var(--color-text-tertiary)]">
                      Or continue with
                    </span>
                                    </div>
                                </div>

                                {/* Google Login */}
                                <button
                                    onClick={() => (window.location.href = googleLoginUrl())}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-[var(--color-border)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-surface-elevated)] transition-all duration-300 group"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-500)] transition-colors">
                    Continue with Google
                  </span>
                                </button>

                                {/* Sign Up Link */}
                                <p className="text-center text-sm text-[var(--color-text-secondary)]">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/register"
                                        className="font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
                                    >
                                        Sign up for free
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}