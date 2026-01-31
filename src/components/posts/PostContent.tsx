import React from "react";
import { BlockNoteRenderer } from "../Editor/BlockNoteRenderer";

interface PostContentProps {
    blocks: any[];
}

export function PostContent({ blocks }: PostContentProps) {
    return (
        <section className="mb-16 animate-fade-in">
            <div className="prose-custom">
                <BlockNoteRenderer blocks={blocks} />
            </div>
        </section>
    );
}