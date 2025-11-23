// src/components/ThemeProvider.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    actualTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}

const THEME_KEY = "app-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    const getSystemTheme = useCallback((): "light" | "dark" => {
        if (typeof window === "undefined") return "light";
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }, []);

    const applyTheme = useCallback((resolved: "light" | "dark") => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove("light", "dark");

        // Add the correct class
        root.classList.add(resolved);

        // Set data attribute for CSS
        root.setAttribute("data-theme", resolved);

        // Update state
        setActualTheme(resolved);
    }, []);

    // Initialize theme on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(THEME_KEY) as Theme | null;
            const initial = saved ?? "system";
            setThemeState(initial);

            const resolved = initial === "system" ? getSystemTheme() : initial;
            applyTheme(resolved);
        } catch (error) {
            console.error("Failed to load theme:", error);
            applyTheme("light");
        } finally {
            setMounted(true);
        }
    }, [getSystemTheme, applyTheme]);

    // Listen to system theme changes when theme is "system"
    useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handler = (e: MediaQueryListEvent | MediaQueryList) => {
            const newTheme = e.matches ? "dark" : "light";
            applyTheme(newTheme);
        };

        // Initial call
        handler(mediaQuery);

        // Add listener
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        }
    }, [theme, applyTheme]);

    // Apply theme when it changes
    useEffect(() => {
        if (!mounted) return;

        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolved);
    }, [theme, mounted, getSystemTheme, applyTheme]);

    const setTheme = useCallback((newTheme: Theme) => {
        try {
            localStorage.setItem(THEME_KEY, newTheme);
        } catch (error) {
            console.error("Failed to save theme:", error);
        }

        setThemeState(newTheme);
    }, []);

    // Prevent flash of unstyled content
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--color-border)]"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-[var(--color-brand-500)] border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}