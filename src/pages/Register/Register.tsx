// src/pages/Register/Register.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { register } from "../../services/auth";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../components/GoogleLoginButton";

export default function Register() {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        re_password: "",
    });
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        if (form.password !== form.re_password) {
            setErr(t('auth.register.passwordsMustMatch'));
            return;
        }

        if (form.password.length < 8) {
            setErr(t('auth.register.passwordTooShort'));
            return;
        }

        if (!agreedToTerms) {
            setErr(t('auth.register.agreeToTerms'));
            return;
        }

        setLoading(true);
        try {
            const res = await register(form);
            navigate("/register/verify", {
                state: { email: res.email, otp_token: res.otp_token },
            });
        } catch (e: any) {
            setErr(
                e?.response?.data?.detail ||
                Object.values(e?.response?.data || {})[0] as string ||
                t('auth.register.failed')
            );
        } finally {
            setLoading(false);
        }
    };

    const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[480px]">
                <div className="animate-slide-up">
                    {/* Minimalist Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-[2rem] font-semibold text-[var(--color-text-primary)] mb-2 tracking-tight">
                            {t('auth.register.title')}
                        </h1>
                        <p className="text-[0.9375rem] text-[var(--color-text-tertiary)] font-normal">
                            {t('auth.register.subtitle')}
                        </p>
                    </div>

                    <Card className="border-[var(--color-border)] shadow-sm">
                        <div className="p-8 space-y-6">
                            {/* Google Login */}
                            <GoogleLoginButton onError={setErr} />

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--color-border)]" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-3 text-[0.75rem] font-medium bg-[var(--color-surface)] text-[var(--color-text-tertiary)] uppercase tracking-wider">
                                        {t('auth.or')}
                                    </span>
                                </div>
                            </div>

                            {/* Error Message */}
                            {err && (
                                <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 animate-fade-in">
                                    <p className="text-[0.8125rem] text-red-700 dark:text-red-300 leading-relaxed">{err}</p>
                                </div>
                            )}

                            <form onSubmit={onSubmit} className="space-y-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" required>
                                        {t('auth.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        placeholder={t('auth.emailPlaceholder')}
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">{t('auth.register.firstName')}</Label>
                                        <Input
                                            id="first_name"
                                            value={form.first_name}
                                            onChange={(e) => update("first_name", e.target.value)}
                                            placeholder={t('auth.register.firstNamePlaceholder')}
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">{t('auth.register.lastName')}</Label>
                                        <Input
                                            id="last_name"
                                            value={form.last_name}
                                            onChange={(e) => update("last_name", e.target.value)}
                                            placeholder={t('auth.register.lastNamePlaceholder')}
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" required>
                                        {t('auth.password')}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => update("password", e.target.value)}
                                        placeholder={t('auth.register.createPassword')}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <p className="text-[0.8125rem] text-[var(--color-text-tertiary)] mt-1.5">
                                        {t('auth.register.passwordHint')}
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="re_password" required>
                                        {t('auth.register.confirmPassword')}
                                    </Label>
                                    <Input
                                        id="re_password"
                                        type="password"
                                        value={form.re_password}
                                        onChange={(e) => update("re_password", e.target.value)}
                                        placeholder={t('auth.register.confirmPasswordPlaceholder')}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start gap-3 pt-2">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand-600)] focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-0 cursor-pointer transition-colors"
                                    />
                                    <label htmlFor="terms" className="text-[0.875rem] text-[var(--color-text-secondary)] leading-relaxed cursor-pointer">
                                        {t('auth.register.iAgreeToThe')}{" "}
                                        <Link to="/terms" className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:underline font-medium">
                                            {t('auth.register.terms')}
                                        </Link>{" "}
                                        {t('auth.register.and')}{" "}
                                        <Link to="/privacy" className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:underline font-medium">
                                            {t('auth.register.privacyPolicy')}
                                        </Link>
                                    </label>
                                </div>

                                <Button type="submit" className="w-full mt-6" isLoading={loading}>
                                    {t('auth.register.createAccountButton')}
                                </Button>
                            </form>
                        </div>
                    </Card>

                    {/* Sign In Link */}
                    <p className="text-center text-[0.875rem] text-[var(--color-text-tertiary)] mt-6">
                        {t('auth.register.alreadyHaveAccount')}{" "}
                        <Link
                            to="/login"
                            className="font-medium text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-300)] transition-colors"
                        >
                            {t('auth.login.signIn')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}