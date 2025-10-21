import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-3 rounded-xl text-base
              bg-[var(--color-surface)] 
              border-2 border-[var(--color-border)]
              text-[var(--color-text-primary)] 
              placeholder-[var(--color-text-tertiary)]
              transition-all duration-300
              focus:outline-none 
              focus:border-[var(--color-brand-500)]
              focus:shadow-lg
              hover:border-[var(--color-border-strong)]
              disabled:opacity-50 
              disabled:cursor-not-allowed
              ${icon ? "pl-12" : ""}
              ${error ? "border-red-500 focus:border-red-500" : ""}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;