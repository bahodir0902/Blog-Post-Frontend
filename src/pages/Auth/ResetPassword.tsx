import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { resetPassword } from "../../services/auth";

export default function ResetPassword() {
    const { state } = useLocation() as { state?: { uid: string; token: string } };
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (p1 !== p2) {
            setErr("Passwords don't match");
            return;
        }
        setErr(null);
        setLoading(true);
        try {
            const r = await resetPassword({ uid: state?.uid!, token: state?.token!, new_password: p1, re_new_password: p2 });
            setOk(r.message);
            setTimeout(()=>navigate("/login"), 1200);
        } catch (e:any) {
            setErr(e?.response?.data?.detail || Object.values(e?.response?.data || {})[0] as string || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <form className="p-6 space-y-4" onSubmit={onSubmit}>
                    <h2 className="text-2xl font-semibold">Set a new password</h2>
                    <Label>New password</Label>
                    <Input type="password" value={p1} onChange={(e)=>setP1(e.target.value)} required />
                    <Label>Confirm new password</Label>
                    <Input type="password" value={p2} onChange={(e)=>setP2(e.target.value)} required />
                    {err && <div className="text-sm text-red-600">{err}</div>}
                    {ok && <div className="text-sm text-green-600">{ok}</div>}
                    <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save password"}</Button>
                </form>
            </Card>
        </div>
    );
}
