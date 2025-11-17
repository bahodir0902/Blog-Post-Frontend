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

    // Disable auto-select to prevent "Continue as [Name]"
    useEffect(() => {
        let mounted = true;
        const tryDisable = () => {
            if (!mounted) return;
            if (typeof window !== "undefined" && window.google?.accounts?.id?.disableAutoSelect) {
                window.google.accounts.id.disableAutoSelect();
            } else {
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
                <button
                    disabled
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg opacity-50 cursor-not-allowed shadow-sm"
                    type="button"
                >
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                        Signing in...
                    </span>
                </button>
            ) : (
                <div className="google-button-wrapper">
                    <style>{`
                        .google-button-wrapper {
                            position: relative;
                            width: 100%;
                        }
                        .google-button-wrapper > div {
                            width: 100% !important;
                        }
                        .google-button-wrapper iframe {
                            width: 100% !important;
                            height: 44px !important;
                        }
                        .google-button-wrapper [role="button"] {
                            width: 100% !important;
                            height: 44px !important;
                            border-radius: 0.5rem !important;
                            border: 1px solid rgb(209 213 219) !important;
                            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
                            transition: all 0.2s !important;
                        }
                        .google-button-wrapper [role="button"]:hover {
                            background-color: rgb(249 250 251) !important;
                            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) !important;
                        }
                        .google-button-wrapper [role="button"]:active {
                            background-color: rgb(243 244 246) !important;
                        }
                    `}</style>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        width={440}
                    />
                </div>
            )}
        </div>
    );
}