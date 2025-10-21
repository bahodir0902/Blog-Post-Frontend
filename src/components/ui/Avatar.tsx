interface AvatarProps {
    src?: string | null;
    alt?: string;
    initials?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function Avatar({ src, alt = "User", initials = "U", size = "md" }: AvatarProps) {
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-14 w-14 text-lg",
        xl: "h-20 w-20 text-2xl",
    };

    if (src) {
        return (
            <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-[var(--color-border)] shadow-md hover:shadow-lg transition-all duration-300`}>
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`
        ${sizes[size]} rounded-full 
        bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)]
        flex items-center justify-center 
        font-bold text-white
        shadow-md hover:shadow-lg
        transition-all duration-300
        hover:scale-105
      `}
        >
            {initials.toUpperCase()}
        </div>
    );
}