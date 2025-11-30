interface ImageBlockProps {
    block: any;
}

export function ImageBlock({block}: ImageBlockProps) {
    const url = block.props?.url || "";
    const caption = block.props?.caption || block.props?.name || "";
    const align = block.props?.textAlignment || "left";
    const pxWidth = Number(block.props?.previewWidth);
    const styleWidth = Number.isFinite(pxWidth) && pxWidth > 0 ? {maxWidth: pxWidth} : {};

    if (!url) return null;

    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    return (
        <figure className={`my-12 ${alignClass}`}>
            <div
                className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl hover:shadow-2xl transition-shadow duration-300"
                style={styleWidth}
            >
                <img
                    src={url}
                    alt={caption || "Image"}
                    className="block w-full h-auto object-contain"
                    loading="lazy"
                />
            </div>
            {caption && (
                <figcaption className="mt-4 text-sm text-[var(--color-text-tertiary)] italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}
