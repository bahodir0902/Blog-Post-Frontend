// src/pages/PostDetail.tsx
import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPost } from "../services/posts";
import Card from "../components/ui/Card";

/* ======================= utils: shape + conversion ======================= */

function safeParseJSON(value: any) {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

type EditorJsDoc = { blocks?: Array<{ type: string; data?: any }> };
type BlockNoteDoc = { blocks?: any[] };

const isEditorJs = (d: any): d is EditorJsDoc =>
    d && Array.isArray(d.blocks) && d.blocks.length > 0 && d.blocks[0]?.data !== undefined;

const isBlockNoteDoc = (d: any): d is BlockNoteDoc =>
    d && Array.isArray(d.blocks) && (d.blocks.length === 0 || d.blocks[0]?.data === undefined);

const isBlocksArray = (d: any) =>
    Array.isArray(d) && (d.length === 0 || d[0]?.data === undefined);

function convertEditorJsToBlockNote(editorJsData: any) {
    if (!editorJsData || !Array.isArray(editorJsData.blocks)) return undefined;
    const out: any[] = [];

    for (const b of editorJsData.blocks) {
        try {
            switch (b.type) {
                case "paragraph": {
                    const text: string = b.data?.text ?? "";
                    out.push({ type: "paragraph", content: text });
                    break;
                }
                case "header": {
                    let level = Number(b.data?.level ?? 1);
                    if (!Number.isFinite(level)) level = 1;
                    out.push({ type: "heading", props: { level }, content: b.data?.text ?? "" });
                    break;
                }
                case "list": {
                    const items: string[] = Array.isArray(b.data?.items) ? b.data.items : [];
                    const listType = b.data?.style === "unordered" ? "bulletListItem" : "numberedListItem";
                    items.forEach((item) => out.push({ type: listType as any, content: item ?? "" }));
                    break;
                }
                case "checklist": {
                    const items = Array.isArray(b.data?.items) ? b.data.items : [];
                    items.forEach((it: any) =>
                        out.push({
                            type: "checkListItem",
                            props: { checked: !!it?.checked },
                            content: it?.text ?? "",
                        })
                    );
                    break;
                }
                case "quote": {
                    const text = b.data?.text ?? "";
                    const caption = b.data?.caption ?? "";
                    out.push({
                        type: "paragraph",
                        content: [{ type: "text", text, styles: { italic: true } }],
                    });
                    if (caption) out.push({ type: "paragraph", content: `— ${caption}` });
                    break;
                }
                case "code": {
                    out.push({ type: "codeBlock", content: b.data?.code ?? "" });
                    break;
                }
                case "table": {
                    const rowsSrc = Array.isArray(b.data?.content) ? b.data.content : [];
                    const rows = rowsSrc.map((row: any[]) => ({
                        cells: (Array.isArray(row) ? row : []).map((cell) => cell ?? ""),
                    }));
                    out.push({ type: "table", content: { type: "tableContent", rows } });
                    break;
                }
                case "image": {
                    const url = b.data?.file?.url ?? b.data?.url ?? b.data?.image?.url ?? "";
                    const caption = b.data?.caption ?? "";
                    if (url) out.push({ type: "image", props: { url, caption } });
                    else out.push({ type: "paragraph", content: "[missing image]" });
                    break;
                }
                case "linkTool": {
                    const link = b.data?.link ?? "";
                    const meta = b.data?.meta ?? {};
                    if (meta.image?.url) {
                        out.push({ type: "image", props: { url: meta.image.url, caption: meta.title || link } });
                    }
                    out.push({
                        type: "paragraph",
                        content: [{ type: "link", props: { url: link }, content: meta.title || link }],
                    });
                    if (meta.description) out.push({ type: "paragraph", content: meta.description });
                    break;
                }
                default: {
                    out.push({ type: "paragraph", content: JSON.stringify(b.data ?? {}) });
                }
            }
        } catch {
            // ignore bad block
        }
    }

    return out.length ? out : undefined;
}

function toBlocks(data: any): any[] {
    const parsed = safeParseJSON(data);
    const d = parsed ?? data;

    if (!d) return [];

    if (isBlocksArray(d)) return d as any[];

    if (isBlockNoteDoc(d)) return (d.blocks ?? []) as any[];

    if (isEditorJs(d)) return convertEditorJsToBlockNote(d) ?? [];

    if (typeof d === "string") return [{ type: "paragraph", content: d }];
    return [];
}

/* ======================= pretty renderer ======================= */

type RichProps = { blocks: any[] };

const alignClass = (a?: string) =>
    a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

function isEmptyParagraph(b: any) {
    if (b.type !== "paragraph") return false;
    if (typeof b.content === "string") return b.content.trim() === "";
    if (Array.isArray(b.content)) return b.content.every((n) => (typeof n.text === "string" ? n.text.trim() === "" : false));
    return false;
}

function Rich({ blocks }: RichProps) {
    const renderInline = (value: any, key?: React.Key): React.ReactNode => {
        if (value == null) return null;
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.map((n, i) => renderInline(n, i));

        // objects
        if (value.type === "text") {
            const s = value.styles || {};
            let node: React.ReactNode = value.text ?? "";
            if (s.code) node = <code key={key}>{node}</code>;
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

    const renderParagraph = (b: any, k: number) => (
        <p
            key={k}
            className={`leading-8 text-[var(--color-text-primary)] ${alignClass(
                b.props?.textAlignment
            )}`}
        >
            {renderInline(b.content)}
        </p>
    );

    const renderHeading = (b: any, k: number) => {
        const lvl = Math.min(Math.max(Number(b.props?.level ?? 2), 1), 6);
        const common =
            "font-extrabold tracking-tight text-[var(--color-text-primary)] mt-10 mb-4 " +
            alignClass(b.props?.textAlignment);

        const content = renderInline(b.content);
        switch (lvl) {
            case 1:
                return <h2 key={k} className={`text-3xl md:text-4xl ${common}`}>{content}</h2>;
            case 2:
                return <h3 key={k} className={`text-2xl md:text-3xl ${common}`}>{content}</h3>;
            case 3:
                return <h4 key={k} className={`text-xl md:text-2xl ${common}`}>{content}</h4>;
            case 4:
                return <h5 key={k} className={`text-lg md:text-xl ${common}`}>{content}</h5>;
            case 5:
                return <h6 key={k} className={`text-base md:text-lg ${common}`}>{content}</h6>;
            default:
                return <h6 key={k} className={`text-base md:text-lg ${common}`}>{content}</h6>;
        }
    };

    const renderCode = (b: any, k: number) => (
        <pre
            key={k}
            className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 overflow-x-auto text-sm leading-7 text-[var(--color-text-primary)]"
        >
      <code>{typeof b.content === "string" ? b.content : JSON.stringify(b.content)}</code>
    </pre>
    );

    const renderImage = (b: any, k: number) => {
        const url = b.props?.url || "";
        if (!url) return null;

        const caption = b.props?.caption || b.props?.name || "";
        const align = alignClass(b.props?.textAlignment);
        const pxWidth = Number(b.props?.previewWidth);
        const styleWidth = Number.isFinite(pxWidth) && pxWidth > 0 ? { maxWidth: pxWidth } : {};

        return (
            <figure key={k} className={`my-10 ${align}`}>
                <div
                    className="inline-block w-full sm:w-auto rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
                    style={styleWidth}
                >
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img
                        src={url}
                        alt={caption || "image"}
                        className="block w-full h-auto object-contain"
                        loading="lazy"
                    />
                </div>
                {caption ? (
                    <figcaption className="mt-3 text-sm text-[var(--color-text-tertiary)]">{caption}</figcaption>
                ) : null}
            </figure>
        );
    };

    const renderTable = (b: any, k: number) => {
        const rows: Array<{ cells: any[] }> = b.content?.rows || b.content?.content?.rows || [];
        if (!rows.length) return null;

        return (
            <div key={k} className="my-8 -mx-2 sm:mx-0 overflow-x-auto">
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
    };

    const renderChecklist = (items: any[], key: React.Key) => (
        <ul key={key} className="my-6 space-y-3">
            {items.map((it, i) => (
                <li key={i} className="flex items-start gap-3">
          <span
              className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-md border-2 ${
                  it.props?.checked ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)]" : "border-[var(--color-border)]"
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

    const renderSimpleList = (items: any[], ordered: boolean, key: React.Key) => {
        const cls = "my-6 pl-6 space-y-2";
        return ordered ? (
            <ol key={key} className={`list-decimal ${cls}`}>
                {items.map((it, i) => (
                    <li key={i} className="leading-8">{renderInline(it.content)}</li>
                ))}
            </ol>
        ) : (
            <ul key={key} className={`list-disc ${cls}`}>
                {items.map((it, i) => (
                    <li key={i} className="leading-8">{renderInline(it.content)}</li>
                ))}
            </ul>
        );
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
            out.push(renderSimpleList(group, false, `ul-${i}`));
            continue;
        }
        if (b.type === "numberedListItem") {
            const group = [b];
            i++;
            while (i < blocks.length && blocks[i].type === "numberedListItem") group.push(blocks[i++]);
            out.push(renderSimpleList(group, true, `ol-${i}`));
            continue;
        }
        if (b.type === "checkListItem") {
            const group = [b];
            i++;
            while (i < blocks.length && blocks[i].type === "checkListItem") group.push(blocks[i++]);
            out.push(renderChecklist(group, `cl-${i}`));
            continue;
        }

        if (b.type === "paragraph") out.push(renderParagraph(b, i));
        else if (b.type === "heading") out.push(renderHeading(b, i));
        else if (b.type === "codeBlock") out.push(renderCode(b, i));
        else if (b.type === "image") out.push(renderImage(b, i));
        else if (b.type === "table") out.push(renderTable(b, i));
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

/* ======================= page ======================= */

export default function PostDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { data: post, isLoading, isError } = useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPost(slug!),
        enabled: !!slug,
    });

    const blocks = useMemo(() => toBlocks(post?.content), [post?.content]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-12 w-3/4 skeleton" />
                    <div className="h-6 w-1/2 skeleton" />
                    <div className="aspect-[21/9] skeleton rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-4 w-full skeleton" />
                        <div className="h-4 w-full skeleton" />
                        <div className="h-4 w-3/4 skeleton" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Post not found</h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">The post you're looking for doesn't exist or has been removed.</p>
                    <Link to="/">
                        <button className="btn px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] text-white">
                            Back to Home
                        </button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            {/* breadcrumb */}
            <nav className="mb-6 md:mb-8 flex items-center gap-2 text-sm text-[var(--color-text-tertiary)]">
                <Link to="/" className="hover:text-[var(--color-brand-500)] transition-colors">Home</Link>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-[var(--color-text-primary)] line-clamp-1">{post.title}</span>
            </nav>

            {/* header */}
            <header className="mb-6 md:mb-10">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-[var(--color-text-primary)]">
                    {post.title}
                </h1>

                <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>~5 min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>1.2K views</span>
                    </div>
                </div>

                {post.short_description && (
                    <p className="mt-4 text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
                        {post.short_description}
                    </p>
                )}
            </header>

            {/* cover */}
            {post.cover_image && (
                <div className="mb-10 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-[var(--shadow-lg)]">
                    <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
                </div>
            )}

            {/* content */}
            <section className="mb-14">
                <Card className="p-4 sm:p-6 md:p-10">
                    <Rich blocks={blocks} />
                </Card>
            </section>

            {/* author + share (kept same structure) */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            A
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-[var(--color-text-primary)]">Author Name</h3>
                            <p className="text-sm text-[var(--color-text-tertiary)]">Content Creator</p>
                        </div>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors">
                            Follow
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">Share this post</h3>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-brand-500)] transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* related */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Related Articles</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} hover className="overflow-hidden group">
                            <div className="aspect-[16/9] bg-gradient-to-br from-[var(--color-brand-100)] to-[var(--color-brand-200)] dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]" />
                            <div className="p-4 space-y-2">
                                <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-500)] transition-colors line-clamp-2">
                                    Related Post Title {i}
                                </h3>
                                <p className="text-sm text-[var(--color-text-tertiary)]">5 min read</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </article>
    );
}
