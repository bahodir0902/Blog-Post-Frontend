import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { register } from "../../services/auth";
import { Link, useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErr(null);

        if (form.password !== form.re_password) {
            setErr("Passwords do not match");
            return;
        }

        if (form.password.length < 8) {
            setErr("Password must be at least 8 characters long");
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
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
            <div className="w-full max-w-lg animate-scale-in">
                <Card>
                    <div className="p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
                                Create Account
                            </h2>
                            <p className="text-[var(--color-text-secondary)]">
                                Join our community today
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

                        <form onSubmit={onSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" required>
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => update("email", e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={form.first_name}
                                        onChange={(e) => update("first_name", e.target.value)}
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={form.last_name}
                                        onChange={(e) => update("last_name", e.target.value)}
                                        placeholder="Doe"
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

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="re_password" required>
                                    Confirm Password
                                </Label>
                                <Input
                                    id="re_password"
                                    type="password"
                                    value={form.re_password}
                                    onChange={(e) => update("re_password", e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    icon={
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    required
                                    className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-0"
                                />
                                <label htmlFor="terms" className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    I agree to the{" "}
                                    <Link to="#" className="text-[var(--color-brand-500)] hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="#" className="text-[var(--color-brand-500)] hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            <Button type="submit" className="w-full" isLoading={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </Button>
                        </form>

                        {/* Sign In Link */}
                        <p className="text-center text-sm text-[var(--color-text-secondary)] pt-4 border-t border-[var(--color-border)]">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}