// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            className = "",
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary:
                "bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white hover:shadow-lg hover:shadow-[var(--color-brand-500)]/25 hover:-translate-y-0.5 focus-visible:ring-[var(--color-brand-500)] active:scale-[0.98]",
            secondary:
                "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] hover:border-[var(--color-brand-400)] hover:bg-[var(--color-surface-elevated)] focus-visible:ring-[var(--color-brand-500)]",
            danger:
                "bg-gradient-to-r from-[var(--color-error)] to-red-600 text-white hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 focus-visible:ring-red-500 active:scale-[0.98]",
            ghost:
                "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] focus-visible:ring-[var(--color-brand-500)]",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-5 py-2.5 text-base",
            lg: "px-7 py-3.5 text-lg",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;