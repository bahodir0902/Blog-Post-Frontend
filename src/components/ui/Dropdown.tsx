import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = { label: string; value: string };
type Props = {
    label?: string;
    options: Option[];
    value?: string;
    onChange: (value: string, option?: Option) => void;
    className?: string;
    placeholder?: string;
};

export default function Dropdown({
                                     label,
                                     options,
                                     value,
                                     onChange,
                                     className = "",
                                     placeholder = "Select...",
                                 }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            {label && (
                <div className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                    {label}
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="
                    w-full px-4 py-2.5 rounded-xl
                    bg-[var(--color-surface)] border border-[var(--color-border)]
                    hover:border-[var(--color-border-strong)]
                    text-left text-[var(--color-text-primary)]
                    flex items-center justify-between gap-2
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-1
                "
            >
                <span className="truncate text-sm">
                    {selected?.label ?? (
                        <span className="text-[var(--color-text-tertiary)]">{placeholder}</span>
                    )}
                </span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute z-50 mt-1 w-full rounded-xl overflow-hidden
                        bg-[var(--color-surface)] border border-[var(--color-border)]
                        shadow-xl animate-scale-in
                    "
                >
                    <ul className="py-1 max-h-64 overflow-y-auto">
                        {options.map((opt) => {
                            const active = opt.value === value;
                            return (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        className={`
                                            w-full text-left px-4 py-2.5 text-sm
                                            transition-all duration-150
                                            ${active
                                            ? "bg-[var(--color-brand-500)] text-white font-medium"
                                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]"
                                        }
                                        `}
                                        onClick={() => {
                                            onChange(opt.value, opt);
                                            setOpen(false);
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}