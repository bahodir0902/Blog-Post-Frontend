import React, {useState} from "react";
import {Check, Copy} from "lucide-react";

interface CodeBlockProps {
    block: any;
}

export function CodeBlock({ block }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const extractCodeContent = (content: any): string => {
        if (typeof content === "string") return content;
        if (Array.isArray(content)) {
            return content
                .map(item => {
                    if (typeof item === "string") return item;
                    if (item && typeof item === "object" && "text" in item) {
                        return item.text || "";
                    }
                    return "";
                })
                .join("");
        }
        if (content && typeof content === "object" && "text" in content) {
            return content.text || "";
        }
        return JSON.stringify(content);
    };

    const codeContent = extractCodeContent(block.content);
    const language = block.props?.language || "text";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-10 group">
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 shadow-2xl overflow-hidden border border-gray-700/50 dark:border-gray-800/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-gray-800/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/30 dark:border-gray-800/30">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-sm"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/90 shadow-sm"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/90 shadow-sm"></div>
                        </div>
                        <div className="h-4 w-px bg-gray-600/50"></div>
                        <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                            {language}
                        </span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 active:scale-95"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                            </>
                        )}
                    </button>
                </div>

                {/* Code Content */}
                <div className="relative">
                    <pre className="overflow-x-auto p-6 text-sm leading-relaxed">
                        <code className="font-mono text-gray-100">
                            {codeContent.split('\n').map((line, i) => (
                                <div key={i} className="table-row hover:bg-gray-700/20 transition-colors">
                                    <span className="table-cell pr-6 text-right select-none text-gray-500 font-medium min-w-[3rem] sticky left-0 bg-gradient-to-r from-gray-900/90 to-transparent">
                                        {i + 1}
                                    </span>
                                    <span className="table-cell pl-4">
                                        {line || " "}
                                    </span>
                                </div>
                            ))}
                        </code>
                    </pre>
                </div>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/10 pointer-events-none"></div>
            </div>
        </div>
    );
}
