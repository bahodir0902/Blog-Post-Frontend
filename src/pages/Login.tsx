// src/pages/Login.tsx
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import Card from "../components/ui/Card";
import Label from "../components/ui/Label";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OtpInput from "../components/ui/OtpInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
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
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[440px]">
                <div className="animate-slide-up">
                    {/* Minimalist Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-[2rem] font-semibold text-[var(--color-text-primary)] mb-2 tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-[0.9375rem] text-[var(--color-text-tertiary)] font-normal">
                            Sign in to your account
                        </p>
                    </div>

                    <Card className="border-[var(--color-border)] shadow-sm">
                        <div className="p-8 space-y-6">
                            {/* Error Message */}
                            {err && (
                                <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 animate-fade-in">
                                    <p className="text-[0.8125rem] text-red-700 dark:text-red-300 leading-relaxed">{err}</p>
                                </div>
                            )}

                            {/* OTP Stage */}
                            {otpToken ? (
                                <form onSubmit={onSubmit} className="space-y-6">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-elevated)]">
                                            <svg className="w-6 h-6 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1.5">
                                                Two-Factor Authentication
                                            </h3>
                                            <p className="text-[0.875rem] text-[var(--color-text-tertiary)]">
                                                Enter the 6-digit code from your authenticator app
                                            </p>
                                        </div>
                                    </div>

                                    <OtpInput value={otp} onChange={setOtp} length={6} autoFocus />

                                    <div className="space-y-3 pt-2">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            isLoading={loading}
                                            disabled={otp.length < 6}
                                        >
                                            Verify & Continue
                                        </Button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOtpToken(null);
                                                setOtp("");
                                                setErr(null);
                                            }}
                                            className="w-full text-[0.875rem] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors font-medium py-2"
                                        >
                                            ← Back to login
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {/* Google Login */}
                                    <GoogleLoginButton onError={setErr} />

                                    {/* Divider */}
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[var(--color-border)]" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-3 text-[0.75rem] font-medium bg-[var(--color-surface)] text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                                Or
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email/Password Form */}
                                    <form onSubmit={onSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" required>
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                required
                                                autoComplete="email"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" required>
                                                    Password
                                                </Label>
                                                <Link
                                                    to="/forgot-password"
                                                    className="text-[0.8125rem] font-medium text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-300)] transition-colors"
                                                >
                                                    Forgot?
                                                </Link>
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter password"
                                                required
                                                autoComplete="current-password"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full mt-6" isLoading={loading}>
                                            Sign In
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Sign Up Link */}
                    <p className="text-center text-[0.875rem] text-[var(--color-text-tertiary)] mt-6">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-300)] transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}