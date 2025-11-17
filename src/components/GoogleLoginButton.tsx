// src/components/GoogleLoginButton.tsx
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../services/auth";
import { useState } from "react";

interface GoogleLoginButtonProps {
    onError?: (error: string) => void;
}

export default function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
    const { setTokens } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            onError?.("No credential received from Google");
            return;
        }

        setLoading(true);
        try {
            const data = await googleLogin(credentialResponse.credential);
            setTokens(data.access, data.refresh);
            navigate("/");
        } catch (error: any) {
            console.error("Google login error:", error);
            const errorMsg =
                error?.response?.data?.detail ||
                "Google login failed. Please try again.";
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => {
        onError?.("Google login failed. Please try again.");
    };

    return (
        <div className="w-full">
            {loading ? (
                <div className="w-full flex items-center justify-center py-3 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            Signing in with Google...
                        </span>
                    </div>
                </div>
            ) : (
                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        width="100%"
                        text="continue_with"
                        shape="rectangular"
                        logo_alignment="left"
                    />
                </div>
            )}
        </div>
    );
}