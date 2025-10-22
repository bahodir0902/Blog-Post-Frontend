// src/components/Editor/WriterEditor.tsx
import React, { useEffect, useRef, useState } from "react";
import { BlockNoteSchema, defaultBlockSpecs, PartialBlock } from "@blocknote/core";
import { createCodeBlockSpec } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { uploadTempPostImage, uploadPostImage } from "../../services/authorPosts";

type WriterEditorProps = {
    initialData?: any; // Editor.js doc OR BlockNote doc OR stringified JSON
    onReady?: () => void;
    onChange?: (data: any) => void; // will receive { time, blocks }
    postSlug?: string;
    onTempImage?: (imageId: number) => void;
};

/* ---------------- utils: parse + shape checks ---------------- */

function safeParseJSON(value: any) {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        console.warn("[WriterEditor] content was a string but not valid JSON");
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

/** Normalize ANY incoming shape to BlockNote blocks */
function toInitialBlocks(data: any): PartialBlock[] {
    // NEW: handle content as a string (DB may store JSONField as string)
    const parsed = safeParseJSON(data);
    const d = parsed ?? data;

    if (!d) return [{ type: "paragraph", content: "" }];

    if (isBlocksArray(d)) {
        return d as PartialBlock[];
    }

    if (isBlockNoteDoc(d)) {
        const blocks = (d.blocks ?? []) as PartialBlock[];
        return blocks.length ? blocks : [{ type: "paragraph", content: "" }];
    }

    if (isEditorJs(d)) {
        const converted = convertEditorJsToBlockNote(d);
        return converted?.length ? converted : [{ type: "paragraph", content: "" }];
    }

    return [{ type: "paragraph", content: "" }];
}

/* -------- Editor.js -> BlockNote converter (hardened) -------- */
function convertEditorJsToBlockNote(editorJsData: any): PartialBlock[] | undefined {
    if (!editorJsData || !Array.isArray(editorJsData.blocks)) return undefined;
    const out: PartialBlock[] = [];

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
                    if (level < 1) level = 1;
                    if (level > 3) level = 3;
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
                    // @ts-ignore inline content array is fine
                    out.push({ type: "paragraph", content: [{ type: "text", text, styles: { italic: true } }] });
                    if (caption) out.push({ type: "paragraph", content: `-- ${caption}` });
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
                    // @ts-ignore BlockNote table shape
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
                    // @ts-ignore
                    out.push({ type: "paragraph", content: [{ type: "link", props: { url: link }, content: meta.title || link }] });
                    if (meta.description) out.push({ type: "paragraph", content: meta.description });
                    break;
                }
                default: {
                    console.warn("Unsupported Editor.js block type:", b.type);
                    out.push({ type: "paragraph", content: JSON.stringify(b.data ?? {}) });
                }
            }
        } catch (e) {
            console.error("Conversion error for block:", b, e);
        }
    }

    return out.length ? out : undefined;
}

/* --------------------------- component --------------------------- */
export default function WriterEditor({
                                         initialData,
                                         onReady,
                                         onChange,
                                         postSlug,
                                         onTempImage,
                                     }: WriterEditorProps) {
    const isInitializedRef = useRef(false);
    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDarkMode(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const editor = useCreateBlockNote(
        {
            initialContent: toInitialBlocks(initialData),
            uploadFile: async (file: File) => {
                try {
                    if (postSlug) {
                        const res = await uploadPostImage(postSlug, file);
                        return res.url;
                    } else {
                        const res = await uploadTempPostImage(file);
                        onTempImage?.(res.id);
                        return res.url;
                    }
                } catch (err) {
                    console.error("Upload failed:", err);
                    throw new Error("Image upload failed");
                }
            },
            schema: BlockNoteSchema.create({
                blockSpecs: {
                    ...defaultBlockSpecs,
                    codeBlock: createCodeBlockSpec(),
                },
            }),
        },
        [] // create once
    );

    useEffect(() => {
        if (editor && !isInitializedRef.current) {
            console.log("✅ BlockNote is ready!");
            isInitializedRef.current = true;
            onReady?.();
        }
    }, [editor, onReady]);

    return (
        <div className="blocknote-editor-container">
            <BlockNoteView
                editor={editor}
                theme={darkMode ? "dark" : "light"}
                onChange={() => onChange?.({ time: Date.now(), blocks: editor.document })}
            />
        </div>
    );
}
