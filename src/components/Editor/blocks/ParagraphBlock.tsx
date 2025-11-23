import React from "react";
import { alignClass } from "../../utils/blockNoteUtils";

interface ParagraphBlockProps {
    block: any;
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function ParagraphBlock({ block, renderInline }: ParagraphBlockProps) {
    return (
        <p
            className={`leading-8 text-[var(--color-text-primary)] ${alignClass(
                block.props?.textAlignment
            )}`}
        >
            {renderInline(block.content)}
        </p>
    );
}