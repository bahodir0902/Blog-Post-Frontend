// src/components/Editor/WriterEditor.tsx
import React, { useEffect, useRef } from "react";
import type EditorJS from "@editorjs/editorjs";

type WriterEditorProps = {
    initialData?: any;
    onReady?: () => void;
    onChange?: (data: any) => void;
};

export default function WriterEditor({ initialData, onReady, onChange }: WriterEditorProps) {
    const holderId = useRef(`edjs-${Math.random().toString(36).slice(2)}`);
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const Editor = (await import("@editorjs/editorjs")).default;
            const Header = (await import("@editorjs/header")).default;
            const List = (await import("@editorjs/list")).default;
            const Quote = (await import("@editorjs/quote")).default;
            const LinkTool = (await import("@editorjs/link")).default;
            const Table = (await import("@editorjs/table")).default;
            const Code = (await import("@editorjs/code")).default;
            const Paragraph = (await import("@editorjs/paragraph")).default;
            // NOTE: we enable Image tool only by URL to avoid needing a post slug during creation.
            const ImageTool = (await import("@editorjs/image")).default;

            if (!mounted) return;

            const instance = new Editor({
                holder: holderId.current,
                autofocus: true,
                placeholder: "Write your story...",
                tools: {
                    header: { class: Header, inlineToolbar: true, config: { levels: [2,3,4], defaultLevel: 2 } },
                    paragraph: { class: Paragraph, inlineToolbar: true },
                    list: { class: List, inlineToolbar: true },
                    quote: { class: Quote, inlineToolbar: true },
                    linkTool: { class: LinkTool, config: { endpoint: "" } }, // no server-side link meta parser
                    table: { class: Table, inlineToolbar: true },
                    code: { class: Code },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                // Only URL uploads in create flow (safe with JSONField)
                                uploadByUrl: async (url: string) => {
                                    return { success: 1, file: { url } };
                                },
                            },
                            captionPlaceholder: "Write a caption",
                        },
                    },
                },
                data: initialData ?? { time: Date.now(), blocks: [{ type: "paragraph", data: { text: "" } }] },
                onReady: () => onReady?.(),
                onChange: async () => {
                    const saved = await instance.save();
                    onChange?.(saved);
                },
            });

            editorRef.current = instance;
        })();

        return () => {
            mounted = false;
            if (editorRef.current?.destroy) editorRef.current.destroy();
            editorRef.current = null;
        };
    }, []);

    return <div id={holderId.current} className="min-h-[320px]" />;
}
