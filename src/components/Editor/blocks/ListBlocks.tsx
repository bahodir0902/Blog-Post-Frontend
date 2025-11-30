import React from "react";

interface ChecklistBlockProps {
    items: any[];
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function ChecklistBlock({ items, renderInline }: ChecklistBlockProps) {
    return (
        <ul className="my-8 space-y-3">
            {items.map((it, i) => (
                <li key={i} className="flex items-start gap-3.5 group">
                    <span
                        className={`mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                            it.props?.checked
                                ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)] shadow-sm"
                                : "border-[var(--color-border)] group-hover:border-[var(--color-brand-300)]"
                        }`}
                    >
                        {it.props?.checked && (
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </span>
                    <span className={`leading-8 ${it.props?.checked ? "text-[var(--color-text-tertiary)] line-through" : "text-[var(--color-text-primary)]"}`}>
                        {renderInline(it.content)}
                    </span>
                </li>
            ))}
        </ul>
    );
}

interface SimpleListBlockProps {
    items: any[];
    ordered: boolean;
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function SimpleListBlock({ items, ordered, renderInline }: SimpleListBlockProps) {
    const Tag = ordered ? "ol" : "ul";
    const listStyle = ordered ? "list-decimal" : "list-disc";

    return (
        <Tag className={`my-8 pl-8 space-y-3 ${listStyle} marker:text-[var(--color-brand-500)]`}>
            {items.map((it, i) => (
                <li key={i} className="leading-8 text-[var(--color-text-primary)] pl-2">
                    {renderInline(it.content)}
                </li>
            ))}
        </Tag>
    );
}
