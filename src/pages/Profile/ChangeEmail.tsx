import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { requestEmailChange } from "../../services/user";
import { useNavigate } from "react-router-dom";

export default function ChangeEmail() {
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        if (email !== confirmEmail) {
            setErr("Email addresses do not match");
            return;
        }

        setLoading(true);
        try {
            const r = await requestEmailChange(email);
            navigate("/profile/change-email/confirm", {
                state: { otp_token: r.otp_token, new_email: email },
            });
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                "Failed to send verification code. Please try again."
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
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                                    Change Email
                                </h2>
                            </div>
                            <p className="text-[var(--color-text-secondary)] ml-14">
                                Update your email address
                            </p>
                        </div>

                        {/* Warning Message */}
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    You'll need to verify your new email address before the change takes effect.
                                </p>
                            </div>
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

                        {/* Form */}
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" required>
                                    New Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="newemail@example.com"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmEmail" required>
                                    Confirm New Email
                                </Label>
                                <Input
                                    id="confirmEmail"
                                    type="email"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    placeholder="newemail@example.com"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button type="submit" className="flex-1" isLoading={loading}>
                                    {loading ? "Sending code..." : "Send Verification Code"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
}