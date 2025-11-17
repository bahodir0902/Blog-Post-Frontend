// src/pages/Register/VerifyRegistration.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import OtpInput from "../../components/ui/OtpInput";
import Button from "../../components/ui/Button";
import { verifyRegistration } from "../../services/auth";
import { useAuth } from "../../auth/AuthContext";

export default function VerifyRegistration() {
    const { state } = useLocation() as { state?: { email?: string; otp_token?: string } };
    const [code, setCode] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const { setTokens } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        try {
            const res = await verifyRegistration({
                otp_token: state?.otp_token,
                code,
                email: state?.email,
            });

            if (res.tokens?.access && res.tokens?.refresh) {
                setTokens(res.tokens.access, res.tokens.refresh);
            }
            navigate("/");
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                "Verification failed. Please check the code."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        // In a real app, you'd call an API to resend the code
        setTimeout(() => {
            setResending(false);
            setErr(null);
        }, 2000);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-md">
                <div className="animate-slide-up">
                    <Card className="backdrop-blur-xl">
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                                        Verify Your Email
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        We sent a verification code to
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] mt-1">
                                        {state?.email || "your email"}
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
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-center block text-sm font-medium">
                                        Enter 6-digit code
                                    </Label>
                                    <OtpInput value={code} onChange={setCode} length={6} autoFocus />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={loading}
                                    disabled={code.length < 6}
                                >
                                    Verify & Continue
                                </Button>
                            </form>

                            {/* Resend Code */}
                            <div className="text-center space-y-3 pt-2">
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Didn't receive the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-sm font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-300)] transition-colors disabled:opacity-50"
                                >
                                    {resending ? "Sending..." : "Resend Code"}
                                </button>
                            </div>

                            {/* Help Text */}
                            <div className="pt-6 border-t border-[var(--color-border)]">
                                <div className="flex gap-3 p-4 rounded-lg bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20 border border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)]/30">
                                    <svg className="w-5 h-5 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                        Check your spam folder if you don't see the email. The code expires in 10 minutes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}