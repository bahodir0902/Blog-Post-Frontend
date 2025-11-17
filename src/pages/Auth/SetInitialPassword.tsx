// src/pages/Auth/SetInitialPassword.tsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { validateInvite, setInitialPassword } from "../../services/auth";

const MIN_PASSWORD_LENGTH = Number(import.meta.env.VITE_MIN_PASSWORD_LENGTH) || 8;

export default function SetInitialPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [validatingLink, setValidatingLink] = useState(true);
    const [linkValid, setLinkValid] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Password strength calculator
    useEffect(() => {
        let strength = 0;
        if (newPassword.length >= MIN_PASSWORD_LENGTH) strength += 1;
        if (/[A-Z]/.test(newPassword)) strength += 1;
        if (/[a-z]/.test(newPassword)) strength += 1;
        if (/\d/.test(newPassword)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) strength += 1;
        setPasswordStrength(strength);
    }, [newPassword]);

    // Validate invite link on mount
    useEffect(() => {
        const validateLink = async () => {
            if (!uid || !token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const response = await validateInvite(uid, token);
                if (response.valid) {
                    setLinkValid(true);
                } else {
                    const errors = response.errors;
                    if (errors?.detail?.[0] === "already_activated") {
                        setError("This link has already been used. Password is already set.");
                    } else if (errors?.token) {
                        setError("Invalid or expired link.");
                    } else if (errors?.uid) {
                        setError("Invalid link.");
                    } else {
                        setError("Link is invalid or has expired.");
                    }
                }
            } catch (err) {
                setError("Unable to verify link. Please try again later.");
            } finally {
                setValidatingLink(false);
            }
        };

        validateLink();
    }, [uid, token, navigate]);

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return "bg-red-500";
        if (passwordStrength <= 2) return "bg-yellow-500";
        if (passwordStrength <= 3) return "bg-blue-500";
        return "bg-green-500";
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return "Weak";
        if (passwordStrength <= 2) return "Fair";
        if (passwordStrength <= 3) return "Good";
        return "Strong";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
            return;
        }

        setLoading(true);

        try {
            const response = await setInitialPassword({
                uid: uid!,
                token: token!,
                new_password: newPassword,
                re_password: confirmPassword,
            });

            // Store tokens
            if (response.tokens) {
                localStorage.setItem("access", response.tokens.access);
                localStorage.setItem("refresh", response.tokens.refresh);
            }

            // Redirect to home
            navigate("/", { replace: true });
        } catch (err: any) {
            if (err.response?.data) {
                const errorData = err.response.data;
                if (typeof errorData === "string") {
                    setError(errorData);
                } else if (errorData.non_field_errors) {
                    setError(errorData.non_field_errors[0]);
                } else if (errorData.new_password) {
                    setError(errorData.new_password[0]);
                } else if (errorData.re_password) {
                    setError(errorData.re_password[0]);
                } else {
                    setError("An error occurred. Please try again.");
                }
            } else {
                setError("An error occurred. Please check your internet connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Validating link state
    if (validatingLink) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    <div className="animate-slide-up">
                        <Card className="backdrop-blur-xl">
                            <div className="p-6 sm:p-8 space-y-6 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                                    Verifying Link...
                                </h2>
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid link state
    if (!linkValid) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    <div className="animate-slide-up">
                        <Card className="backdrop-blur-xl">
                            <div className="p-6 sm:p-8 space-y-6 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20">
                                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>

                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                                        Invalid Link
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        This activation link is invalid or has expired
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 animate-fade-in">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={() => navigate("/login")}
                                    className="w-full"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Set password form
    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-md">
                <div className="animate-slide-up">
                    <Card className="backdrop-blur-xl">
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                                        Set Your Password
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Create a secure password for your account (minimum {MIN_PASSWORD_LENGTH} characters)
                                    </p>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 animate-fade-in">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="new_password" required>
                                        New Password
                                    </Label>
                                    <Input
                                        id="new_password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Create a strong password"
                                        required
                                        autoComplete="new-password"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        }
                                    />

                                    {/* Password Strength Indicator */}
                                    {newPassword && (
                                        <div className="space-y-2 pt-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-[var(--color-text-tertiary)]">
                                                    Password Strength
                                                </span>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength <= 1 ? "text-red-500" :
                                                        passwordStrength <= 2 ? "text-yellow-500" :
                                                            passwordStrength <= 3 ? "text-blue-500" : "text-green-500"
                                                }`}>
                                                    {getPasswordStrengthText()}
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password" required>
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        required
                                        autoComplete="new-password"
                                        icon={
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        }
                                    />

                                    {/* Password Match Indicator */}
                                    {confirmPassword && (
                                        <div className="flex items-center gap-2 pt-1">
                                            {newPassword === confirmPassword ? (
                                                <>
                                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs text-green-500">Passwords match</p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-xs text-red-500">Passwords don't match</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full mt-6"
                                    isLoading={loading}
                                    disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                                >
                                    Set Password
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}