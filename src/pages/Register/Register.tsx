// src/pages/Register/Register.tsx
import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { register } from "../../services/auth";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../components/GoogleLoginButton";

export default function Register() {
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
            setErr("Passwords do not match");
            return;
        }

        if (form.password.length < 8) {
            setErr("Password must be at least 8 characters");
            return;
        }

        if (!agreedToTerms) {
            setErr("Please agree to the Terms of Service and Privacy Policy");
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
                "Registration failed. Please try again."
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
                            Create account
                        </h1>
                        <p className="text-[0.9375rem] text-[var(--color-text-tertiary)] font-normal">
                            Start your journey today
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
                                        Or
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
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First name</Label>
                                        <Input
                                            id="first_name"
                                            value={form.first_name}
                                            onChange={(e) => update("first_name", e.target.value)}
                                            placeholder="John"
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last name</Label>
                                        <Input
                                            id="last_name"
                                            value={form.last_name}
                                            onChange={(e) => update("last_name", e.target.value)}
                                            placeholder="Doe"
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" required>
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => update("password", e.target.value)}
                                        placeholder="Create a password"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <p className="text-[0.8125rem] text-[var(--color-text-tertiary)] mt-1.5">
                                        At least 8 characters
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="re_password" required>
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="re_password"
                                        type="password"
                                        value={form.re_password}
                                        onChange={(e) => update("re_password", e.target.value)}
                                        placeholder="Confirm password"
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
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:underline font-medium">
                                            Terms
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:underline font-medium">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                <Button type="submit" className="w-full mt-6" isLoading={loading}>
                                    Create Account
                                </Button>
                            </form>
                        </div>
                    </Card>

                    {/* Sign In Link */}
                    <p className="text-center text-[0.875rem] text-[var(--color-text-tertiary)] mt-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-300)] transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}