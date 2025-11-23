import React from "react";
import Card from "../ui/Card";
import { BlockNoteRenderer } from "../Editor/BlockNoteRenderer";

interface PostContentProps {
    blocks: any[];
}

export function PostContent({ blocks }: PostContentProps) {
    return (
        <section className="mb-14">
            <Card className="p-4 sm:p-6 md:p-10">
                <BlockNoteRenderer blocks={blocks} />
            </Card>
        </section>
    );
}