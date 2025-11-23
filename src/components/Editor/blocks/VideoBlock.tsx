import React from "react";
import { alignClass, getYouTubeEmbedUrl, isVideoFile } from "../../utils/blockNoteUtils";

interface VideoBlockProps {
    block: any;
}

export function VideoBlock({ block }: VideoBlockProps) {
    const url = block.props?.url || "";
    if (!url) return null;

    const caption = block.props?.caption || "";
    const align = alignClass(block.props?.textAlignment);
    const pxWidth = Number(block.props?.previewWidth);
    const styleWidth = Number.isFinite(pxWidth) && pxWidth > 0 ? { maxWidth: pxWidth } : {};

    // Check if it's a YouTube URL
    const youtubeEmbedUrl = getYouTubeEmbedUrl(url);

    if (youtubeEmbedUrl) {
        return (
            <figure className={`my-10 ${align}`}>
                <div
                    className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
                    style={styleWidth || { maxWidth: "100%" }}
                >
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                            src={youtubeEmbedUrl}
                            title={caption || "Video"}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
                {caption && (
                    <figcaption className="mt-3 text-sm text-[var(--color-text-tertiary)] text-center">
                        {caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    // Handle direct video files
    if (isVideoFile(url)) {
        return (
            <figure className={`my-10 ${align}`}>
                <div
                    className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
                    style={styleWidth || { maxWidth: "100%" }}
                >
                    <video
                        src={url}
                        controls
                        className="w-full h-auto"
                        preload="metadata"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                {caption && (
                    <figcaption className="mt-3 text-sm text-[var(--color-text-tertiary)] text-center">
                        {caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    // Fallback: try to embed as iframe
    return (
        <figure className={`my-10 ${align}`}>
            <div
                className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
                style={styleWidth || { maxWidth: "100%" }}
            >
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                        src={url}
                        title={caption || "Embedded video"}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
            {caption && (
                <figcaption className="mt-3 text-sm text-[var(--color-text-tertiary)] text-center">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}