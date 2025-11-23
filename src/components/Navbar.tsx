import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "./ThemeProvider";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Menu, X, Sun, Moon, PenTool, User, LogOut, FileText, Heart, Bookmark } from "lucide-react";

export default function Navbar() {
    const { accessToken, logout } = useAuth();
    const { actualTheme, setTheme } = useTheme();
    const { user, canWrite, isLoading: meLoading } = useCurrentUser();

    const navigate = useNavigate();
    const location = useLocation();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        { path: "/", label: "Home" },
        { path: "/explore", label: "Explore" },
        { path: "/about", label: "About" },
    ];

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.first_name) return "U";
        const firstInitial = user.first_name[0]?.toUpperCase() || "U";
        const lastInitial = user.last_name?.[0]?.toUpperCase() || "";
        return firstInitial + lastInitial;
    };

    return (
        <header className="sticky top-0 z-50 glass-effect border-b border-[var(--color-border)] shadow-sm">
            <nav className="container-responsive py-3 md:py-4">
                <div className="flex items-center justify-between gap-4 md:gap-6">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 md:gap-3 group transition-transform duration-300 hover:scale-105"
                    >
                        <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-700)] shadow-md flex items-center justify-center overflow-hidden">
                            <span className="text-white font-bold text-lg md:text-xl relative z-10">M</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] bg-clip-text text-transparent">
                            ModernBlog
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive(link.path)
                                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-300)]"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                }
                                `}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Writer actions (desktop) - Only show if authorized AND can write */}
                        {accessToken && !meLoading && canWrite && (
                            <div className="hidden lg:flex items-center gap-2">
                                <Link
                                    to="/writer/my-posts"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>My Posts</span>
                                </Link>
                                <Link
                                    to="/writer/new"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-brand-600)] text-white shadow-sm hover:shadow-md hover:bg-[var(--color-brand-700)] transition-all duration-200"
                                >
                                    <PenTool className="w-4 h-4" />
                                    <span>Write</span>
                                </Link>
                            </div>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 md:p-2.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {actualTheme === "dark" ? (
                                <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-text-secondary)]" />
                            )}
                        </button>

                        {/* Auth menu */}
                        {accessToken ? (
                            <div className="relative hidden md:block" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                    aria-label="User menu"
                                >
                                    {/* Avatar with profile photo support */}
                                    {user?.profile_photo ? (
                                        <img
                                            src={user.profile_photo}
                                            alt={user.first_name || "User"}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-[var(--color-border)] ring-2 ring-transparent hover:ring-[var(--color-brand-500)] transition-all"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-semibold text-sm border-2 border-[var(--color-border)] ring-2 ring-transparent hover:ring-[var(--color-brand-500)] transition-all">
                                            {getUserInitials()}
                                        </div>
                                    )}
                                    <svg
                                        className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform duration-200 ${
                                            dropdownOpen ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu - Enhanced with Favourites & Bookmarks */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-60 animate-scale-in origin-top-right">
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden">
                                            {/* User Info Header */}
                                            <div className="p-4 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
                                                <div className="flex items-center gap-3">
                                                    {user?.profile_photo ? (
                                                        <img
                                                            src={user.profile_photo}
                                                            alt={user.first_name || "User"}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border)]"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-lg border-2 border-[var(--color-border)]">
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
                                            <div className="py-2">
                                                <button
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-3"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span className="font-medium">Profile</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/favourites");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)] transition-colors flex items-center gap-3 group"
                                                >
                                                    <Heart className="w-4 h-4 group-hover:fill-current" />
                                                    <span className="font-medium">Favourites</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/bookmarks");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)] transition-colors flex items-center gap-3 group"
                                                >
                                                    <Bookmark className="w-4 h-4 group-hover:fill-current" />
                                                    <span className="font-medium">Read Later</span>
                                                </button>

                                                <div className="my-2 border-t border-[var(--color-border)]" />

                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3 font-medium"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2 md:gap-3">
                                <Link
                                    to="/login"
                                    className="px-3 lg:px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in border-t border-[var(--color-border)] pt-4">
                        {/* User info (mobile) with profile photo */}
                        {accessToken && user && (
                            <div className="px-4 py-3 mb-2 bg-[var(--color-surface-elevated)] rounded-lg flex items-center gap-3">
                                {user.profile_photo ? (
                                    <img
                                        src={user.profile_photo}
                                        alt={user.first_name || "User"}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-border)]"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-base border-2 border-[var(--color-border)]">
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

                        {/* Nav links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive(link.path)
                                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-300)]"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                }
                                `}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Writer actions (mobile) - Only if authorized AND can write */}
                        {accessToken && !meLoading && canWrite && (
                            <>
                                <Link
                                    to="/writer/my-posts"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] transition-all duration-200"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>My Posts</span>
                                </Link>
                                <Link
                                    to="/writer/new"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-[var(--color-brand-600)] text-white"
                                >
                                    <PenTool className="w-4 h-4" />
                                    <span>Write Post</span>
                                </Link>
                            </>
                        )}

                        {/* Mobile auth actions */}
                        {accessToken ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    <User className="w-5 h-5" />
                                    Profile
                                </Link>
                                <Link
                                    to="/favourites"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)] transition-all duration-200"
                                >
                                    <Heart className="w-5 h-5" />
                                    Favourites
                                </Link>
                                <Link
                                    to="/bookmarks"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-brand-600)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)] transition-all duration-200"
                                >
                                    <Bookmark className="w-5 h-5" />
                                    Read Later
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-3 rounded-lg text-sm font-semibold text-center bg-[var(--color-brand-600)] text-white"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}