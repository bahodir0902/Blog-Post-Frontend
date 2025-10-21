// src/components/Navbar.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import Avatar from "./ui/Avatar";
import { useTheme } from "./ThemeProvider";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Menu, X, Sun, Moon, PenTool, User, Edit, LogOut, FileText } from "lucide-react";

export default function Navbar() {
    const { accessToken, logout } = useAuth();
    const { actualTheme, setTheme } = useTheme();
    const { canWrite, isLoading: meLoading } = useCurrentUser();

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

    // close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

    const toggleTheme = () => {
        // Respect ThemeProvider (light/dark)
        setTheme(actualTheme === "dark" ? "light" : "dark");
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: "/", label: "Home" },
        { path: "/explore", label: "Explore" },
        { path: "/about", label: "About" },
    ];

    return (
        <header className="sticky top-0 z-50 glass-effect border-b border-[var(--color-border)] shadow-md">
            <nav className="container-responsive py-4">
                <div className="flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
                    >
                        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg flex items-center justify-center overflow-hidden">
                            <span className="text-white font-bold text-xl relative z-10">M</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              ModernBlog
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                }
                `}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Writer actions (desktop) */}
                        {accessToken && !meLoading && canWrite && (
                            <>
                                <Link
                                    to="/writer/new"
                                    className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                >
                                    <PenTool className="w-4 h-4" />
                                    <span>Create post</span>
                                </Link>
                                <Link
                                    to="/writer/my-posts"
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] transition-all"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>My posts</span>
                                </Link>
                            </>
                        )}

                        {/* Become Author Button - Desktop (when logged out) */}
                        {!accessToken && (
                            <Link
                                to="/register"
                                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                            >
                                <PenTool className="w-4 h-4" />
                                <span>Write</span>
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg bg-[var(--color-surface-elevated)] hover:bg-[var(--color-border)] transition-all duration-200 hover:scale-110"
                            aria-label="Toggle theme"
                        >
                            {actualTheme === "dark" ? (
                                <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            )}
                        </button>

                        {/* Auth menu */}
                        {accessToken ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--color-surface-elevated)] transition-all duration-300"
                                    aria-label="User menu"
                                >
                                    <Avatar initials="U" />
                                    <svg
                                        className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 animate-scale-in origin-top-right">
                                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden">
                                            <div className="p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-b border-[var(--color-border)]">
                                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Account</p>
                                                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Manage your profile</p>
                                            </div>

                                            <div className="py-2">
                                                {/* Writer quick links inside dropdown (optional) */}
                                                {canWrite && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                navigate("/writer/new");
                                                                setDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-3"
                                                        >
                                                            <PenTool className="w-5 h-5" />
                                                            Create post
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigate("/writer/my-posts");
                                                                setDropdownOpen(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-3"
                                                        >
                                                            <FileText className="w-5 h-5" />
                                                            My posts
                                                        </button>

                                                        <div className="my-2 border-t border-[var(--color-border)]" />
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        navigate("/profile");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-3"
                                                >
                                                    <User className="w-5 h-5" />
                                                    View Profile
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/profile/edit");
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-3"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                    Edit Profile
                                                </button>

                                                <div className="my-2 border-t border-[var(--color-border)]" />

                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3 font-medium"
                                                >
                                                    <LogOut className="w-5 h-5" />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--color-text-primary)] text-white hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2.5 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                  block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                }
                `}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Writer actions (mobile) */}
                        {accessToken && !meLoading && canWrite && (
                            <>
                                <Link
                                    to="/writer/new"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                                >
                                    <PenTool className="w-4 h-4" />
                                    <span>Create post</span>
                                </Link>
                                <Link
                                    to="/writer/my-posts"
                                    className="block px-4 py-3 rounded-lg text-sm font-medium bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] text-center"
                                >
                                    My posts
                                </Link>
                            </>
                        )}

                        {/* Logged out CTAs (mobile) */}
                        {!accessToken && (
                            <>
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                                >
                                    <PenTool className="w-4 h-4" />
                                    <span>Become an Author</span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-200 text-center"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-3 rounded-lg text-sm font-semibold bg-[var(--color-text-primary)] text-white text-center"
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
