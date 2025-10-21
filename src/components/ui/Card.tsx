interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
}

export default function Card({ children, className = "", hover = false, glass = false }: CardProps) {
    const baseStyles = "rounded-2xl border border-[var(--color-border)] transition-all duration-300";

    const hoverStyles = hover ? "hover-lift cursor-pointer" : "";

    const backgroundStyles = glass
        ? "glass-effect"
        : "bg-[var(--color-surface)] shadow-md hover:shadow-lg";

    return (
        <div className={`${baseStyles} ${backgroundStyles} ${hoverStyles} ${className}`}>
            {children}
        </div>
    );
}