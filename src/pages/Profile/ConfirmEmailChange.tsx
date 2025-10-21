import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import OtpInput from "../../components/ui/OtpInput";
import Button from "../../components/ui/Button";
import { confirmEmailChange } from "../../services/user";

export default function ConfirmEmailChange() {
    const { state } = useLocation() as { state?: { otp_token: string; new_email: string } };
    const [code, setCode] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setLoading(true);

        try {
            const r = await confirmEmailChange(state?.otp_token!, code);
            setOk(r.message);
            setTimeout(() => navigate("/profile"), 2000);
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

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
            <div className="w-full max-w-md animate-scale-in">
                <Card>
                    <div className="p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] mb-2">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                                    Verify New Email
                                </h2>
                                <p className="mt-2 text-[var(--color-text-secondary)]">
                                    We sent a verification code to
                                </p>
                                <p className="font-semibold text-[var(--color-brand-500)]">
                                    {state?.new_email}
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
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Redirecting to profile...</p>
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
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-center block">Enter 6-digit code</Label>
                                <OtpInput value={code} onChange={setCode} length={6} autoFocus />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={loading}
                                disabled={code.length < 6 || !!ok}
                            >
                                {loading ? "Confirming..." : "Confirm Email Change"}
                            </Button>
                        </form>

                        {/* Help Text */}
                        <div className="pt-6 border-t border-[var(--color-border)]">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20">
                                <svg className="w-5 h-5 text-[var(--color-brand-500)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    The verification code was sent to your new email address. Check your spam folder if you don't see it.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}