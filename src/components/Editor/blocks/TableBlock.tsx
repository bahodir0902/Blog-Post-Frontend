interface TableBlockProps {
    block: any;
    renderInline: (value: any, key?: React.Key) => React.ReactNode;
}

export function TableBlock({ block, renderInline }: TableBlockProps) {
    const rows: Array<{ cells: any[] }> = block.content?.rows || block.content?.content?.rows || [];

    if (!rows.length) return null;

    return (
        <div className="my-10 -mx-4 sm:mx-0 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl border border-[var(--color-border)] shadow-lg">
                    <table className="min-w-full divide-y divide-[var(--color-border)]">
                        <tbody className="divide-y divide-[var(--color-border)]">
                        {rows.map((row, ri) => (
                            <tr
                                key={ri}
                                className={`${
                                    ri === 0
                                        ? "bg-[var(--color-surface-elevated)]"
                                        : "hover:bg-[var(--color-surface)] transition-colors"
                                }`}
                            >
                                {(row.cells || []).map((cell, ci) => {
                                    const Cell = ri === 0 ? "th" : "td";
                                    return (
                                        <Cell
                                            key={ci}
                                            className={`px-6 py-4 text-left whitespace-nowrap ${
                                                ri === 0
                                                    ? "font-semibold text-[var(--color-text-primary)]"
                                                    : "text-[var(--color-text-secondary)]"
                                            }`}
                                        >
                                            {renderInline(cell)}
                                        </Cell>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
