import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Card from "../../components/ui/Card";

export default function CompleteGoogleProfile() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const email = params.get("email");
    const message = params.get("message");
    const { setTokens } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (access && refresh) {
            setTokens(access, refresh);
            navigate("/", { replace: true });
        }
    }, [access, refresh, setTokens, navigate]);

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <div className="p-6 space-y-2">
                    <h2 className="text-xl font-semibold">Completing Registration…</h2>
                    {message && <p className="text-sm">{message}</p>}
                    {email && <p className="text-sm">Email: {email}</p>}
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">You’ll be redirected shortly.</p>
                </div>
            </Card>
        </div>
    );
}
