// src/components/Navbar.tsx - Premium Redesign
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "./ThemeProvider";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useNotifications } from "../contexts/NotificationContext";
import SearchBar from "./ui/SearchBar";
import {
    Menu,
    X,
    Sun,
    Moon,
    PenLine,
    User,
    LogOut,
    FileText,
    Heart,
    Bookmark,
    Bell,
    ChevronDown,
    Compass,
    BookOpen,
    Home,
    Sparkles
} from "lucide-react";

export default function Navbar() {
    const { accessToken, logout } = useAuth();
    const { actualTheme, setTheme } = useTheme();
    const { user, canWrite, isLoading: meLoading } = useCurrentUser();
    const { unreadCount } = useNotifications();
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

    const toggleTheme = () => {
        setTheme(actualTheme === "dark" ? "light" : "dark");
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: "/", label: t('nav.home'), icon: Home },
        { path: "/explore", label: t('nav.explore'), icon: Compass },
        { path: "/read", label: t('nav.read'), icon: BookOpen },
    ];

    const getUserInitials = () => {
        if (!user?.first_name) return "U";
        const firstInitial = user.first_name[0]?.toUpperCase() || "U";
        const lastInitial = user.last_name?.[0]?.toUpperCase() || "";
        return firstInitial + lastInitial;
    };

    return (
        <header
            className={`
                sticky top-0 z-50 transition-all duration-300
                ${isScrolled
                    ? "glass-effect-strong shadow-md border-b border-[var(--color-border)]"
                    : "bg-[var(--color-background)]/80 backdrop-blur-sm border-b border-transparent"
                }
            `}
        >
            <nav className="container-responsive">
                <div className="flex items-center justify-between h-16 md:h-[72px]">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] shadow-lg flex items-center justify-center overflow-hidden group-hover:shadow-[var(--shadow-brand)] transition-all duration-300">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-lg md:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                                Modern
                            </span>
                            <span className="text-lg md:text-xl font-bold tracking-tight gradient-text-brand">
                                Blog
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Center */}
                    <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                        ${isActive(link.path)
                                        ? "text-[var(--color-brand-600)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-100)] dark:text-[var(--color-brand-600)]"
                                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                    }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                    {isActive(link.path) && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-brand-500)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:block">
                            <SearchBar />
                        </div>

                        {/* Write Button - Desktop */}
                        {accessToken && !meLoading && canWrite && (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/writer/my-posts"
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden lg:inline">{t('nav.myPosts')}</span>
                                </Link>
                                <Link
                                    to="/writer/new"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md hover:shadow-lg hover:shadow-[var(--color-brand-500)]/20 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    <PenLine className="w-4 h-4" />
                                    <span>{t('nav.write')}</span>
                                </Link>
                            </div>
                        )}

                        {/* Notifications Bell */}
                        {accessToken && (
                            <Link
                                to="/notifications"
                                className="relative p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] transition-all duration-200 group"
                                aria-label="Notifications"
                            >
                                <Bell className="w-[18px] h-[18px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[var(--color-error)] rounded-full animate-scale-in shadow-sm">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] transition-all duration-200 group"
                            aria-label="Toggle theme"
                        >
                            {actualTheme === "dark" ? (
                                <Sun className="w-[18px] h-[18px] text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                            ) : (
                                <Moon className="w-[18px] h-[18px] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] group-hover:-rotate-12 transition-all duration-300" />
                            )}
                        </button>

                        {/* Auth menu (Desktop) */}
                        {accessToken ? (
                            <div className="relative hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                    aria-label="User menu"
                                >
                                    {user?.profile_photo ? (
                                        <img
                                            src={user.profile_photo}
                                            alt={user.first_name || "User"}
                                            className="w-8 h-8 rounded-lg object-cover border-2 border-[var(--color-border)] ring-2 ring-transparent hover:ring-[var(--color-brand-400)] transition-all"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-semibold text-xs border-2 border-[var(--color-border)]">
                                            {getUserInitials()}
                                        </div>
                                    )}
                                    <ChevronDown
                                        className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform duration-200 ${
                                            dropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 animate-dropdown origin-top-right">
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden">
                                            {/* User Info Header */}
                                            <div className="p-4 bg-gradient-to-br from-[var(--color-surface-elevated)] to-[var(--color-surface)] border-b border-[var(--color-border)]">
                                                <div className="flex items-center gap-3">
                                                    {user?.profile_photo ? (
                                                        <img
                                                            src={user.profile_photo}
                                                            alt={user.first_name || "User"}
                                                            className="w-11 h-11 rounded-xl object-cover border-2 border-[var(--color-border)]"
                                                        />
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-base">
                                                            {getUserInitials()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                                            {user?.first_name || "User"}
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                                                            {user?.email || ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <button
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all flex items-center gap-3"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span className="font-medium">{t('nav.profile')}</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/favourites");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-100)] transition-all flex items-center gap-3 group"
                                                >
                                                    <Heart className="w-4 h-4 group-hover:fill-current transition-all" />
                                                    <span className="font-medium">{t('nav.favourites')}</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/bookmarks");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-100)] transition-all flex items-center gap-3 group"
                                                >
                                                    <Bookmark className="w-4 h-4 group-hover:fill-current transition-all" />
                                                    <span className="font-medium">{t('nav.bookmarks')}</span>
                                                </button>

                                                <div className="my-2 h-px bg-[var(--color-border)]" />

                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-3 py-2.5 rounded-xl text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-all flex items-center gap-3 font-medium"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    {t('nav.logout')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    {t('auth.signIn')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md hover:shadow-lg hover:shadow-[var(--color-brand-500)]/20 transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    {t('auth.signUp')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-[var(--color-text-primary)]" />
                            ) : (
                                <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2 animate-slide-down border-t border-[var(--color-border)] pt-4 mt-2">
                        {/* Mobile Search Bar */}
                        <div className="pb-3">
                            <SearchBar mobile />
                        </div>

                        {accessToken && user && (
                            <div className="px-3 py-3 mb-2 bg-[var(--color-surface-elevated)] rounded-xl flex items-center gap-3">
                                {user.profile_photo ? (
                                    <img
                                        src={user.profile_photo}
                                        alt={user.first_name || "User"}
                                        className="w-11 h-11 rounded-xl object-cover border-2 border-[var(--color-border)]"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-base">
                                        {getUserInitials()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                                        {user.first_name || "User"}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                        ${isActive(link.path)
                                        ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-100)]"
                                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                    }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            );
                        })}

                        {accessToken && !meLoading && canWrite && (
                            <div className="space-y-2 pt-2">
                                <Link
                                    to="/writer/my-posts"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] transition-all duration-200"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>{t('nav.myPosts')}</span>
                                </Link>
                                <Link
                                    to="/writer/new"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md"
                                >
                                    <PenLine className="w-4 h-4" />
                                    <span>{t('writer.createPost')}</span>
                                </Link>
                            </div>
                        )}

                        {accessToken ? (
                            <div className="space-y-1 pt-2 border-t border-[var(--color-border)] mt-2">
                                <Link
                                    to="/notifications"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    <Bell className="w-5 h-5" />
                                    {t('nav.notifications')}
                                    {unreadCount > 0 && (
                                        <span className="ml-auto min-w-[22px] h-5 px-2 flex items-center justify-center text-xs font-bold text-white bg-[var(--color-error)] rounded-full">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    <User className="w-5 h-5" />
                                    {t('nav.profile')}
                                </Link>
                                <Link
                                    to="/favourites"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-100)] transition-all duration-200"
                                >
                                    <Heart className="w-5 h-5" />
                                    {t('nav.favourites')}
                                </Link>
                                <Link
                                    to="/bookmarks"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-100)] transition-all duration-200"
                                >
                                    <Bookmark className="w-5 h-5" />
                                    {t('nav.bookmarks')}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-all duration-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-2 border-t border-[var(--color-border)] mt-2">
                                <Link
                                    to="/login"
                                    className="block px-4 py-3 rounded-xl text-sm font-medium text-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-200"
                                >
                                    {t('auth.signIn')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-3 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md"
                                >
                                    {t('auth.signUp')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}
