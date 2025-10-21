interface LabelProps {
    htmlFor?: string;
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}

export default function Label({ htmlFor, children, required, className = "" }: LabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-semibold text-[var(--color-text-primary)] mb-2 ${className}`}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}