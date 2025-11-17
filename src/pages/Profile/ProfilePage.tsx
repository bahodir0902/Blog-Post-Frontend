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
            <div className="min-h-screen bg-[var(--color-background)]">
                <div className="max-w-6xl mx-auto px-8 py-20">
                    <div className="space-y-12 animate-pulse">
                        <div className="h-7 w-32 skeleton rounded" />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            <div className="lg:col-span-4">
                                <div className="w-full aspect-square skeleton rounded-2xl" />
                            </div>
                            <div className="lg:col-span-8 space-y-8">
                                <div className="h-8 w-3/4 skeleton rounded" />
                                <div className="h-5 w-1/2 skeleton rounded" />
                                <div className="space-y-6 pt-8">
                                    <div className="h-24 skeleton rounded" />
                                    <div className="h-24 skeleton rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-8">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                        <svg className="w-9 h-9 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-light text-[var(--color-text-primary)] tracking-tight">
                            Unable to Load Profile
                        </h3>
                        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed max-w-sm mx-auto">
                            We encountered an issue retrieving your profile information. Please try again.
                        </p>
                    </div>
                    <Button onClick={() => window.location.reload()} className="mx-auto">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    const u = data.user;
    const fullName = [u.first_name, data.middle_name, u.last_name].filter(Boolean).join(" ") || "User";
    const initials = (u.first_name?.[0] || "") + (u.last_name?.[0] || "");

    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <div className="max-w-6xl mx-auto px-8 py-20">
                {/* Page Header */}
                <div className="mb-16">
                    <h1 className="text-[2.75rem] font-extralight text-[var(--color-text-primary)] tracking-tight leading-none">
                        Profile
                    </h1>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Column - Avatar & Quick Info */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8 space-y-10">
                            {/* Avatar Section */}
                            <div className="relative">
                                <div className="aspect-square w-full">
                                    <Avatar
                                        src={data.profile_photo}
                                        initials={initials}
                                        size="lg"
                                        className="w-full h-full rounded-2xl shadow-sm"
                                    />
                                    {u.status === "Authorized" && (
                                        <div className="absolute bottom-5 right-5 w-6 h-6 rounded-full bg-emerald-500 border-[3px] border-[var(--color-background)] shadow-sm" />
                                    )}
                                </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="space-y-2.5">
                                <StatusBadge
                                    label={u.status}
                                    variant={u.status === "Authorized" ? "success" : "default"}
                                />
                                {u.mfa_enabled && (
                                    <StatusBadge
                                        label="Two-Factor Authentication"
                                        variant="default"
                                        icon={
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        }
                                    />
                                )}
                                <StatusBadge
                                    label={u.role}
                                    variant="brand"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 pt-6">
                                <Link to="/profile/edit" className="block">
                                    <Button variant="outline" size="sm" className="w-full justify-center">
                                        Edit Profile
                                    </Button>
                                </Link>
                                <Link to="/profile/change-email" className="block">
                                    <Button variant="secondary" size="sm" className="w-full justify-center">
                                        Change Email
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Identity Section */}
                        <section className="space-y-8">
                            <SectionHeader title="Identity" />
                            <div className="space-y-2">
                                <h2 className="text-[2rem] font-light text-[var(--color-text-primary)] tracking-tight leading-tight">
                                    {fullName}
                                </h2>
                                <p className="text-lg text-[var(--color-text-secondary)]">
                                    {u.email}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8 pt-6">
                                <DetailItem
                                    label="Phone Number"
                                    value={data.phone_number || "—"}
                                />
                                <DetailItem
                                    label="Date of Birth"
                                    value={data.birth_date ? new Date(data.birth_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                                />
                            </div>
                        </section>

                        {/* Account Activity Section */}
                        <section className="space-y-8">
                            <SectionHeader title="Account Activity" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8">
                                <DetailItem
                                    label="Member Since"
                                    value={new Date(u.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                />
                                <DetailItem
                                    label="Last Login"
                                    value={u.last_login ? new Date(u.last_login).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                                />
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="space-y-8">
                            <SectionHeader title="Security" />

                            <div className="space-y-px bg-[var(--color-border)]/30 rounded-lg overflow-hidden">
                                <SecurityItem
                                    title="Two-Factor Authentication"
                                    status={u.mfa_enabled ? "Enabled" : "Disabled"}
                                    isEnabled={u.mfa_enabled}
                                />
                                <SecurityItem
                                    title="Account Status"
                                    status={u.status}
                                    isEnabled={u.status === "Authorized"}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="pb-4 border-b border-[var(--color-border)]/50">
            <h3 className="text-[0.6875rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em] letter-spacing-wider">
                {title}
            </h3>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-2.5">
            <p className="text-[0.6875rem] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.1em]">
                {label}
            </p>
            <p className="text-[1.0625rem] text-[var(--color-text-primary)] leading-relaxed">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({
                         label,
                         variant = "default",
                         icon
                     }: {
    label: string;
    variant?: "default" | "success" | "brand";
    icon?: React.ReactNode;
}) {
    const variantStyles = {
        default: "bg-[var(--color-surface)] border-[var(--color-border)]/60",
        success: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30",
        brand: "bg-[var(--color-brand-50)]/50 dark:bg-[var(--color-brand-900)]/10 border-[var(--color-brand-200)]/50 dark:border-[var(--color-brand-800)]/30"
    };

    return (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border ${variantStyles[variant]} transition-colors`}>
            {icon}
            <span className="text-[0.9375rem] text-[var(--color-text-primary)] font-normal">
                {label}
            </span>
        </div>
    );
}

function SecurityItem({
                          title,
                          status,
                          isEnabled
                      }: {
    title: string;
    status: string;
    isEnabled: boolean;
}) {
    return (
        <div className="flex items-center justify-between px-6 py-5 bg-[var(--color-background)] hover:bg-[var(--color-surface)]/40 transition-colors">
            <div>
                <p className="text-[var(--color-text-primary)] font-normal text-[0.9375rem]">
                    {title}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isEnabled ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-600"} shadow-sm`} />
                <span className="text-[0.875rem] text-[var(--color-text-secondary)] font-normal min-w-[80px] text-right">
                    {status}
                </span>
            </div>
        </div>
    );
}