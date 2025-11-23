/**
 * Utility functions for BlockNote content conversion and processing
 */

export function safeParseJSON(value: any) {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

type EditorJsDoc = { blocks?: Array<{ type: string; data?: any }> };
type BlockNoteDoc = { blocks?: any[] };

export const isEditorJs = (d: any): d is EditorJsDoc =>
    d && Array.isArray(d.blocks) && d.blocks.length > 0 && d.blocks[0]?.data !== undefined;

export const isBlockNoteDoc = (d: any): d is BlockNoteDoc =>
    d && Array.isArray(d.blocks) && (d.blocks.length === 0 || d.blocks[0]?.data === undefined);

export const isBlocksArray = (d: any) =>
    Array.isArray(d) && (d.length === 0 || d[0]?.data === undefined);

export function convertEditorJsToBlockNote(editorJsData: any) {
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

export function toBlocks(data: any): any[] {
    const parsed = safeParseJSON(data);
    const d = parsed ?? data;

    if (!d) return [];

    if (isBlocksArray(d)) return d as any[];

    if (isBlockNoteDoc(d)) return (d.blocks ?? []) as any[];

    if (isEditorJs(d)) return convertEditorJsToBlockNote(d) ?? [];

    if (typeof d === "string") return [{ type: "paragraph", content: d }];
    return [];
}

export function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;

        if (urlObj.hostname.includes("youtube.com")) {
            videoId = urlObj.searchParams.get("v");
        } else if (urlObj.hostname.includes("youtu.be")) {
            videoId = urlObj.pathname.slice(1).split("?")[0];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch {
        return null;
    }
    return null;
}

export function isVideoFile(url: string): boolean {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
}

export function extractCodeContent(content: any): string {
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
}

export const alignClass = (a?: string) =>
    a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

export function isEmptyParagraph(b: any) {
    if (b.type !== "paragraph") return false;
    if (typeof b.content === "string") return b.content.trim() === "";
    if (Array.isArray(b.content)) return b.content.every((n) => (typeof n.text === "string" ? n.text.trim() === "" : false));
    return false;
}