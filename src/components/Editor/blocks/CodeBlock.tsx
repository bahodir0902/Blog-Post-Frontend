import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "../../ThemeProvider";

interface CodeBlockProps {
    block: any;
}

// Map common language aliases to proper language names
const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    yml: "yaml",
    md: "markdown",
    json: "json",
    html: "markup",
    xml: "markup",
    css: "css",
    scss: "scss",
    sass: "sass",
    jsx: "jsx",
    tsx: "tsx",
    vue: "vue",
    sql: "sql",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    r: "r",
    matlab: "matlab",
    text: "text",
    plaintext: "text",
};

const getLanguageDisplayName = (lang: string): string => {
    const normalized = lang.toLowerCase().trim();
    const mapped = languageMap[normalized] || normalized;
    
    // Capitalize first letter and return
    return mapped.charAt(0).toUpperCase() + mapped.slice(1);
};

export function CodeBlock({ block }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const { actualTheme } = useTheme();

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
    
    // Debug: log block structure to understand the format (uncomment to debug)
    // Uncomment the line below to see the block structure in console
    // console.log("CodeBlock block:", block);
    
    // Try multiple ways to get the language from BlockNote block structure
    let rawLanguage = "text";
    
    // BlockNote stores language in props.language
    if (block.props?.language && block.props.language !== "plain") {
        rawLanguage = block.props.language;
    } 
    // Also check direct language property
    else if (block.language && block.language !== "plain") {
        rawLanguage = block.language;
    }
    // Check if language is in the content structure
    else if (block.content && typeof block.content === "object" && "language" in block.content) {
        rawLanguage = block.content.language;
    }
    
    // Normalize the language - handle empty strings and "plain" as "text"
    if (!rawLanguage || rawLanguage === "plain" || rawLanguage.trim() === "") {
        rawLanguage = "text";
    }
    
    const normalizedLanguage = languageMap[rawLanguage.toLowerCase().trim()] || rawLanguage.toLowerCase().trim();
    const languageDisplayName = getLanguageDisplayName(rawLanguage);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-8 group">
            <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm">
                {/* Minimal Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                            {languageDisplayName}
                        </span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-all duration-150 active:scale-95"
                        aria-label="Copy code"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                <span className="text-[var(--color-success)]">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Code Content with Syntax Highlighting */}
                <div className="relative overflow-hidden">
                    <SyntaxHighlighter
                        language={normalizedLanguage}
                        style={actualTheme === "dark" ? oneDark : oneLight}
                        customStyle={{
                            margin: 0,
                            padding: "1rem",
                            background: "transparent",
                            fontSize: "0.875rem",
                            lineHeight: "1.6",
                            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace",
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily: "inherit",
                            }
                        }}
                        showLineNumbers={false}
                        wrapLines={true}
                        wrapLongLines={true}
                    >
                        {codeContent}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
