import React from "react";

interface ParagraphBlockProps {
    block: any;
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function ParagraphBlock({ block, renderInline }: ParagraphBlockProps) {
    const align = block.props?.textAlignment || "left";
    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    return (
        <p className={`my-6 text-[1.0625rem] leading-[1.8] text-[var(--color-text-primary)] ${alignClass}`}>
            {renderInline(block.content)}
        </p>
    );
}
