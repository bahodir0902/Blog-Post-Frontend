import React from "react";
import { alignClass } from "../../utils/blockNoteUtils";

interface HeadingBlockProps {
    block: any;
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function HeadingBlock({ block, renderInline }: HeadingBlockProps) {
    const lvl = Math.min(Math.max(Number(block.props?.level ?? 2), 1), 6);
    const common =
        "font-extrabold tracking-tight text-[var(--color-text-primary)] mt-10 mb-4 " +
        alignClass(block.props?.textAlignment);

    const content = renderInline(block.content);

    switch (lvl) {
        case 1:
            return <h2 className={`text-3xl md:text-4xl ${common}`}>{content}</h2>;
        case 2:
            return <h3 className={`text-2xl md:text-3xl ${common}`}>{content}</h3>;
        case 3:
            return <h4 className={`text-xl md:text-2xl ${common}`}>{content}</h4>;
        case 4:
            return <h5 className={`text-lg md:text-xl ${common}`}>{content}</h5>;
        case 5:
            return <h6 className={`text-base md:text-lg ${common}`}>{content}</h6>;
        default:
            return <h6 className={`text-base md:text-lg ${common}`}>{content}</h6>;
    }
}