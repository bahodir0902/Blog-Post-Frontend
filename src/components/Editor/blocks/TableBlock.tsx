import React from "react";

interface TableBlockProps {
    block: any;
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function TableBlock({ block, renderInline }: TableBlockProps) {
    const rows: Array<{ cells: any[] }> = block.content?.rows || block.content?.content?.rows || [];
    if (!rows.length) return null;

    return (
        <div className="my-8 -mx-2 sm:mx-0 overflow-x-auto">
            <table className="min-w-[520px] sm:min-w-0 w-full border border-[var(--color-border)] rounded-xl overflow-hidden">
                <tbody>
                {rows.map((r, ri) => (
                    <tr key={ri} className="border-b border-[var(--color-border)] last:border-0">
                        {(r.cells || []).map((cell, ci) => (
                            <td key={ci} className="px-4 py-3 align-top text-[var(--color-text-primary)]">
                                {renderInline(cell)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}