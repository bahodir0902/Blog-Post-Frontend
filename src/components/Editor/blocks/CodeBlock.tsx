import React from "react";
import { extractCodeContent } from "../../utils/blockNoteUtils";

interface CodeBlockProps {
    block: any;
}

export function CodeBlock({ block }: CodeBlockProps) {
    const codeContent = extractCodeContent(block.content);
    const lines = codeContent.split("\n");

    return (
        <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-xs text-[var(--color-text-tertiary)] ml-2 font-mono">
                        {block.props?.language || "code"}
                    </span>
                </div>
                <button
                    onClick={() => navigator.clipboard.writeText(codeContent)}
                    className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--color-surface-elevated)]"
                    title="Copy code"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm leading-7">
                <code className="text-[var(--color-text-primary)] font-mono">
                    {lines.map((line, i) => (
                        <div key={i} className="table-row">
                            <span className="table-cell pr-4 text-right select-none text-[var(--color-text-tertiary)] opacity-50 min-w-[2.5rem]">
                                {i + 1}
                            </span>
                            <span className="table-cell">{line || " "}</span>
                        </div>
                    ))}
                </code>
            </pre>
        </div>
    );
}