// src/pages/Auth/VerifyResetCode.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import OtpInput from "../../components/ui/OtpInput";
import Button from "../../components/ui/Button";
import { verifyReset } from "../../services/auth";

export default function VerifyResetCode() {
    const { t } = useTranslation();
    const { state } = useLocation() as { state?: { email?: string; otp_token?: string } };
    const otp_token = state?.otp_token;
    const email = state?.email;
    const [code, setCode] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!otp_token) {
            navigate("/forgot-password", { replace: true });
        }
    }, [otp_token, navigate]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        try {
            const resp = await verifyReset({ otp_token: otp_token!, code });
            navigate("/reset-password", { state: { uid: resp.uid, token: resp.token } });
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                t("auth.verificationFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    if (!otp_token) return null;

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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                                        {t("auth.enterVerificationCode")}
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {t("auth.weSentCodeTo")}
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] mt-1">
                                        {email ?? t("auth.yourEmail")}
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
                                        {t("auth.enterSixDigitCode")}
                                    </Label>
                                    <OtpInput value={code} onChange={setCode} length={6} autoFocus />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    isLoading={loading}
                                    disabled={code.length < 6}
                                >
                                    {t("auth.verifyCode")}
                                </Button>
                            </form>

                            {/* Help Text */}
                            <div className="pt-6 border-t border-[var(--color-border)]">
                                <div className="flex gap-3 p-4 rounded-lg bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20 border border-[var(--color-brand-200)] dark:border-[var(--color-brand-800)]/30">
                                    <svg className="w-5 h-5 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                        {t("auth.checkSpamFolder")}
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