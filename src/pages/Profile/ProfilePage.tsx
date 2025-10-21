import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../services/user";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Link } from "react-router-dom";

export default function ProfilePage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["me"],
        queryFn: getProfile,
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="p-8 animate-pulse">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-24 h-24 rounded-full skeleton" />
                        <div className="flex-1 space-y-4 w-full">
                            <div className="h-8 w-48 skeleton mx-auto md:mx-0" />
                            <div className="h-4 w-64 skeleton mx-auto md:mx-0" />
                            <div className="flex gap-3 justify-center md:justify-start">
                                <div className="h-10 w-32 skeleton" />
                                <div className="h-10 w-32 skeleton" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        Failed to load profile
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                        We couldn't fetch your profile data. Please try again.
                    </p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </Card>
            </div>
        );
    }

    const u = data.user;
    const fullName = [u.first_name, data.middle_name, u.last_name].filter(Boolean).join(" ") || "User";
    const initials = (u.first_name?.[0] || "") + (u.last_name?.[0] || "");

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Profile Header Card */}
            <Card className="overflow-hidden">
                {/* Cover Background */}
                <div className="h-32 bg-gradient-to-br from-[var(--color-brand-500)] via-[var(--color-brand-600)] to-[var(--color-brand-700)] relative">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16">
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar src={u.profile_photo} initials={initials} size="xl" />
                            <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4 border-[var(--color-surface)]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-2 mt-4">
                            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                                {fullName}
                            </h1>
                            <p className="text-[var(--color-text-secondary)] flex items-center gap-2 justify-center md:justify-start">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                {u.email}
                            </p>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-6 pt-2 justify-center md:justify-start">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${u.status === "Authorized" ? "bg-green-500" : "bg-red-500"}`} />
                                    <span className="text-sm text-[var(--color-text-tertiary)]">{u.status}</span>
                                </div>
                                {u.mfa_enabled && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="text-sm text-[var(--color-text-tertiary)]">2FA Enabled</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Link to="/profile/edit" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </Button>
                            </Link>
                            <Link to="/profile/change-email" className="w-full sm:w-auto">
                                <Button variant="secondary" className="w-full">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Change Email
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Profile Details */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
                        <div className="p-2 rounded-lg bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]">
                            <svg className="w-6 h-6 text-[var(--color-brand-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Personal Information
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <InfoRow
                            label="Full Name"
                            value={fullName}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />
                        <InfoRow
                            label="Phone Number"
                            value={data.phone_number || "Not provided"}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            }
                        />
                        <InfoRow
                            label="Birth Date"
                            value={data.birth_date ? new Date(data.birth_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not provided"}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                    </div>
                </Card>

                {/* Account Settings */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
                        <div className="p-2 rounded-lg bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-900)]">
                            <svg className="w-6 h-6 text-[var(--color-brand-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                            Account Settings
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <InfoRow
                            label="Role"
                            value={u.role}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            }
                        />
                        <InfoRow
                            label="Member Since"
                            value={new Date(u.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <InfoRow
                            label="Last Login"
                            value={u.last_login ? new Date(u.last_login).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Never"}
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            }
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors">
            <div className="text-[var(--color-text-tertiary)]">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">{label}</p>
                <p className="text-sm text-[var(--color-text-primary)] font-medium truncate">{value}</p>
            </div>
        </div>
    );
}