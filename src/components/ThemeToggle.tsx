import { useTheme } from "./ThemeProvider";

const SunIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
    </svg>
);

const MoonIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
    </svg>
);

const MonitorIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
    </svg>
);

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options: Array<{ key: "light" | "dark" | "system"; label: string; icon: JSX.Element }> = [
        { key: "light", label: "Light", icon: <SunIcon /> },
        { key: "dark", label: "Dark", icon: <MoonIcon /> },
        { key: "system", label: "System", icon: <MonitorIcon /> },
    ];

    return (
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            {options.map((opt) => (
                <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className={`
            relative px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-300 ease-out
            flex items-center gap-2
            ${
                        theme === opt.key
                            ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white shadow-md scale-105"
                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                    }
          `}
                    title={opt.label}
                    aria-label={`Switch to ${opt.label} theme`}
                >
          <span className="transition-transform duration-300">
            {opt.icon}
          </span>
                    <span className="hidden sm:inline">{opt.label}</span>

                    {theme === opt.key && (
                        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] opacity-0 animate-ping" />
                    )}
                </button>
            ))}
        </div>
    );
}