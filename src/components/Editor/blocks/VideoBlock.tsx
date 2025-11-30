import React from "react";

interface VideoBlockProps {
    block: any;
}

export function VideoBlock({ block }: VideoBlockProps) {
    const url = block.props?.url || "";
    const caption = block.props?.caption || "";
    const align = block.props?.textAlignment || "left";
    const pxWidth = Number(block.props?.previewWidth);
    const styleWidth = Number.isFinite(pxWidth) && pxWidth > 0 ? { maxWidth: pxWidth } : {};

    if (!url) return null;

    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    const getYouTubeEmbedUrl = (url: string): string | null => {
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
    };

    const isVideoFile = (url: string): boolean => {
        const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
        const lowerUrl = url.toLowerCase();
        return videoExtensions.some(ext => lowerUrl.includes(ext));
    };

    const youtubeEmbedUrl = getYouTubeEmbedUrl(url);

    // YouTube embed
    if (youtubeEmbedUrl) {
        return (
            <figure className={`my-12 ${alignClass}`}>
                <div
                    className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                    style={styleWidth || { maxWidth: "100%" }}
                >
                    <div className="relative w-full aspect-video">
                        <iframe
                            src={youtubeEmbedUrl}
                            title={caption || "Video"}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
                {caption && (
                    <figcaption className="mt-4 text-sm text-[var(--color-text-tertiary)] italic">
                        {caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    // Direct video file
    if (isVideoFile(url)) {
        return (
            <figure className={`my-12 ${alignClass}`}>
                <div
                    className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl hover:shadow-3xl transition-shadow duration-300"
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
                    <figcaption className="mt-4 text-sm text-[var(--color-text-tertiary)] italic">
                        {caption}
                    </figcaption>
                )}
            </figure>
        );
    }

    // Fallback: generic iframe embed
    return (
        <figure className={`my-12 ${alignClass}`}>
            <div
                className="inline-block w-full rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                style={styleWidth || { maxWidth: "100%" }}
            >
                <div className="relative w-full aspect-video">
                    <iframe
                        src={url}
                        title={caption || "Embedded video"}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
            {caption && (
                <figcaption className="mt-4 text-sm text-[var(--color-text-tertiary)] italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}
