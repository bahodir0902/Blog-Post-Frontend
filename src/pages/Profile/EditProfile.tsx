import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "../../services/user";
import Card from "../../components/ui/Card";
import Label from "../../components/ui/Label";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: getProfile });

    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [middle, setMiddle] = useState("");
    const [phone, setPhone] = useState("");
    const [birth, setBirth] = useState("");
    const [mfa, setMfa] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            setFirst(data.user.first_name || "");
            setLast(data.user.last_name || "");
            setMiddle(data.middle_name || "");
            setPhone(data.phone_number || "");
            setBirth(data.birth_date || "");
            setMfa(data.user.mfa_enabled || false);
            setPhotoPreview(data.user.profile_photo || null);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: async () => {
            const payload: any = {
                "user.first_name": first,
                "user.last_name": last,
                "user.mfa_enabled": mfa,
                middle_name: middle || undefined,
                phone_number: phone || undefined,
                birth_date: birth || undefined,
            };
            if (photo) payload.profile_photo = photo;
            return updateProfile(payload, !!photo);
        },
        onSuccess: () => {
            setOk("Profile updated successfully!");
            setErr(null);
            qc.invalidateQueries({ queryKey: ["me"] });
            setTimeout(() => setOk(null), 3000);
        },
        onError: (e: any) => {
            setErr(e?.response?.data?.detail || "Failed to update profile");
            setOk(null);
        },
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="p-8 animate-pulse">
                    <div className="space-y-6">
                        <div className="h-8 w-48 skeleton" />
                        <div className="space-y-4">
                            <div className="h-12 skeleton" />
                            <div className="h-12 skeleton" />
                            <div className="h-12 skeleton" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <Card>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate();
                    }}
                    className="p-8 space-y-8"
                >
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
                                Edit Profile
                            </h2>
                        </div>
                        <p className="text-[var(--color-text-secondary)] ml-14">
                            Update your personal information and settings
                        </p>
                    </div>

                    {/* Success/Error Messages */}
                    {ok && (
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-fade-in">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-green-600 dark:text-green-400">{ok}</p>
                            </div>
                        </div>
                    )}

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

                    {/* Profile Photo Section */}
                    <div className="space-y-4">
                        <Label>Profile Photo</Label>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-border)] shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                        {first?.[0] || "U"}
                                    </div>
                                )}
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] cursor-pointer shadow-lg transition-all hover:scale-110"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Upload a new photo
                                </p>
                                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                                    JPG or PNG. Max size 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-border)]" />

                    {/* Name Fields */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Personal Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="first">First Name</Label>
                                <Input
                                    id="first"
                                    value={first}
                                    onChange={(e) => setFirst(e.target.value)}
                                    placeholder="John"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last">Last Name</Label>
                                <Input
                                    id="last"
                                    value={last}
                                    onChange={(e) => setLast(e.target.value)}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="middle">Middle Name</Label>
                            <Input
                                id="middle"
                                value={middle}
                                onChange={(e) => setMiddle(e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-border)]" />

                    {/* Contact Information */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Contact Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+998 90 123 45 67"
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birth">Birth Date</Label>
                            <Input
                                id="birth"
                                type="date"
                                value={birth}
                                onChange={(e) => setBirth(e.target.value)}
                                icon={
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-border)]" />

                    {/* Security Settings */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Security Settings
                        </h3>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]">
                                    <svg className="w-5 h-5 text-[var(--color-brand-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Two-Factor Authentication
                                    </p>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">
                                        Add an extra layer of security
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={mfa}
                                    onChange={(e) => setMfa(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-[var(--color-border)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-brand-500)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-500)]"></div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Button
                            type="submit"
                            isLoading={mutation.isPending}
                            className="flex-1"
                        >
                            {mutation.isPending ? "Saving changes..." : "Save Changes"}
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
            </Card>
        </div>
    );
}