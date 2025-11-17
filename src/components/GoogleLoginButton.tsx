// src/components/GoogleLoginButton.tsx
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../services/auth";
import { useEffect, useState } from "react";

export default function GoogleLoginButton({ onError }: { onError?: (s: string) => void }) {
    const { setTokens } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Wait for the google script to load, then disable autoSelect
    useEffect(() => {
        let mounted = true;
        const tryDisable = () => {
            if (!mounted) return;
            // `window.google.accounts.id` is added by the library script
            if (typeof window !== "undefined" && window.google?.accounts?.id?.disableAutoSelect) {
                window.google.accounts.id.disableAutoSelect();
            } else {
                // try again shortly until script loads
                setTimeout(tryDisable, 100);
            }
        };
        tryDisable();
        return () => { mounted = false; };
    }, []);

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
        } catch (err: any) {
            const errorMsg = err?.response?.data?.detail || "Google login failed. Please try again.";
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => onError?.("Google login failed. Please try again.");

    return (
        <div className="w-full">
            {loading ? (
                /* your loading markup */
                <div>Signing in with Google...</div>
            ) : (
                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        logo_alignment="left"
                        // width must be a number, not "100%". Use a numeric pixel width:
                        width={360}
                    />
                </div>
            )}
        </div>
    );
}
