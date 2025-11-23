import React from "react";
import { alignClass } from "../../utils/blockNoteUtils";

interface ImageBlockProps {
    block: any;
}

export function ImageBlock({ block }: ImageBlockProps) {
    const url = block.props?.url || "";
    if (!url) return null;

    const caption = block.props?.caption || block.props?.name || "";
    const align = alignClass(block.props?.textAlignment);
    const pxWidth = Number(block.props?.previewWidth);
    const styleWidth = Number.isFinite(pxWidth) && pxWidth > 0 ? { maxWidth: pxWidth } : {};

    return (
        <figure className={`my-10 ${align}`}>
            <div
                className="inline-block w-full sm:w-auto rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
                style={styleWidth}
            >
                <img
                    src={url}
                    alt={caption || "image"}
                    className="block w-full h-auto object-contain"
                    loading="lazy"
                />
            </div>
            {caption && (
                <figcaption className="mt-3 text-sm text-[var(--color-text-tertiary)]">{caption}</figcaption>
            )}
        </figure>
    );
}