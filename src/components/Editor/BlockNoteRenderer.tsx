import React from "react";
import { isEmptyParagraph } from "../utils/blockNoteUtils";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { TableBlock } from "./blocks/TableBlock";
import { ChecklistBlock, SimpleListBlock } from "./blocks/ListBlocks";

interface BlockNoteRendererProps {
    blocks: any[];
}

export function BlockNoteRenderer({ blocks }: BlockNoteRendererProps) {
    const renderInline = (value: any, key?: React.Key): React.ReactNode => {
        if (value == null) return null;
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.map((n, i) => renderInline(n, i));

        // objects
        if (value.type === "text") {
            const s = value.styles || {};
            let node: React.ReactNode = value.text ?? "";
            if (s.code) node = <code key={key} className="px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] text-sm font-mono">{node}</code>;
            if (s.bold) node = <strong key={key}>{node}</strong>;
            if (s.italic) node = <em key={key}>{node}</em>;
            if (s.underline) node = <u key={key}>{node}</u>;
            if (s.strikethrough) node = <s key={key}>{node}</s>;
            if (s.subscript) node = <sub key={key}>{node}</sub>;
            if (s.superscript) node = <sup key={key}>{node}</sup>;
            return node;
        }
        if (value.type === "link") {
            const href = value.props?.url || "#";
            return (
                <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--color-brand-300)] hover:decoration-[var(--color-brand-600)] hover:text-[var(--color-brand-600)] dark:hover:text-[var(--color-brand-400)] transition-colors"
                >
                    {renderInline(value.content)}
                </a>
            );
        }
        return null;
    };

    // group consecutive list items into single lists
    const out: React.ReactNode[] = [];
    let i = 0;

    while (i < blocks.length) {
        const b = blocks[i];

        if (isEmptyParagraph(b)) {
            i++;
            continue;
        }

        if (b.type === "bulletListItem") {
            const group = [b];
            i++;
            while (i < blocks.length && blocks[i].type === "bulletListItem") group.push(blocks[i++]);
            out.push(<SimpleListBlock key={`ul-${i}`} items={group} ordered={false} renderInline={renderInline} />);
            continue;
        }
        if (b.type === "numberedListItem") {
            const group = [b];
            i++;
            while (i < blocks.length && blocks[i].type === "numberedListItem") group.push(blocks[i++]);
            out.push(<SimpleListBlock key={`ol-${i}`} items={group} ordered={true} renderInline={renderInline} />);
            continue;
        }
        if (b.type === "checkListItem") {
            const group = [b];
            i++;
            while (i < blocks.length && blocks[i].type === "checkListItem") group.push(blocks[i++]);
            out.push(<ChecklistBlock key={`cl-${i}`} items={group} renderInline={renderInline} />);
            continue;
        }

        if (b.type === "paragraph") out.push(<ParagraphBlock key={i} block={b} renderInline={renderInline} />);
        else if (b.type === "heading") out.push(<HeadingBlock key={i} block={b} renderInline={renderInline} />);
        else if (b.type === "codeBlock") out.push(<CodeBlock key={i} block={b} />);
        else if (b.type === "image") out.push(<ImageBlock key={i} block={b} />);
        else if (b.type === "video") out.push(<VideoBlock key={i} block={b} />);
        else if (b.type === "table") out.push(<TableBlock key={i} block={b} renderInline={renderInline} />);
        else {
            out.push(
                <pre key={i} className="my-4 text-xs p-3 rounded-lg bg-[var(--color-surface-elevated)] overflow-x-auto">
                    {JSON.stringify(b, null, 2)}
                </pre>
            );
        }

        i++;
    }

    if (!out.length) return null;

    // vertical rhythm + responsive typography
    return <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-0 space-y-5 md:space-y-6">{out}</div>;
}