import React from "react";

interface InlineRenderProps {
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

interface ChecklistProps extends InlineRenderProps {
    items: any[];
}

export function ChecklistBlock({ items, renderInline }: ChecklistProps) {
    return (
        <ul className="my-6 space-y-3">
            {items.map((it, i) => (
                <li key={i} className="flex items-start gap-3">
                    <span
                        className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-md border-2 ${
                            it.props?.checked
                                ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)]"
                                : "border-[var(--color-border)]"
                        }`}
                    >
                        {it.props?.checked ? (
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : null}
                    </span>
                    <span className="leading-8">{renderInline(it.content)}</span>
                </li>
            ))}
        </ul>
    );
}

interface SimpleListProps extends InlineRenderProps {
    items: any[];
    ordered: boolean;
}

export function SimpleListBlock({ items, ordered, renderInline }: SimpleListProps) {
    const cls = "my-6 pl-6 space-y-2";

    return ordered ? (
        <ol className={`list-decimal ${cls}`}>
            {items.map((it, i) => (
                <li key={i} className="leading-8">{renderInline(it.content)}</li>
            ))}
        </ol>
    ) : (
        <ul className={`list-disc ${cls}`}>
            {items.map((it, i) => (
                <li key={i} className="leading-8">{renderInline(it.content)}</li>
            ))}
        </ul>
    );
}