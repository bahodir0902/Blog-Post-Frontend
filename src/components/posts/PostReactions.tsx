// src/components/posts/PostReactions.tsx
import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Smile, ThumbsUp, Star, Zap, ChevronDown } from "lucide-react";
import { listPostReactions, putReaction, removeReaction } from "../../services/reactions";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import type { PostReaction } from "../../types/reactions";

interface PostReactionsProps {
    slug: string;
}

export function PostReactions({ slug }: PostReactionsProps) {
    const { user } = useCurrentUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch post reactions with counts (already filtered by backend)
    const { data: reactions, isLoading } = useQuery({
        queryKey: ["post-reactions", slug],
        queryFn: () => listPostReactions(slug),
        enabled: !!slug,
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const putReactionMutation = useMutation({
        mutationFn: (reactionTypeId: number) =>
            putReaction(slug, { type: reactionTypeId }),
        onSuccess: (updatedReactions) => {
            queryClient.setQueryData(["post-reactions", slug], updatedReactions);
            setIsOpen(false);
        },
        onError: (error: any) => {
            console.error("Failed to put reaction:", error);
        },
    });

    const removeReactionMutation = useMutation({
        mutationFn: () => removeReaction(slug),
        onSuccess: (updatedReactions) => {
            queryClient.setQueryData(["post-reactions", slug], updatedReactions);
            setIsOpen(false);
        },
        onError: (error: any) => {
            console.error("Failed to remove reaction:", error);
        },
    });

    const handleReactionClick = (reaction: PostReaction) => {
        if (!user) {
            navigate("/login", { state: { from: `/post/${slug}` } });
            return;
        }

        // If user already has this reaction, remove it
        if (reaction.my_reaction) {
            removeReactionMutation.mutate();
        } else {
            // Put the new reaction using the ID
            if (reaction.id) {
                putReactionMutation.mutate(reaction.id);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 py-8">
                <div className="h-12 w-32 skeleton rounded-xl" />
            </div>
        );
    }

    // Filter to only show reactions with count > 0 or user's reaction
    const displayReactions = reactions?.filter(r => r.count > 0 || r.my_reaction) || [];
    const allReactions = reactions || [];
    const myReaction = displayReactions.find(r => r.my_reaction);

    if (allReactions.length === 0) {
        return null;
    }

    // Map reaction names to icons
    const getReactionIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("like") || lowerName.includes("thumb")) return ThumbsUp;
        if (lowerName.includes("love") || lowerName.includes("heart")) return Heart;
        if (lowerName.includes("star") || lowerName.includes("favorite")) return Star;
        if (lowerName.includes("smile") || lowerName.includes("happy")) return Smile;
        if (lowerName.includes("zap") || lowerName.includes("energy")) return Zap;
        return null;
    };

    const totalReactions = displayReactions.reduce((sum, r) => sum + r.count, 0);
    const isPending = putReactionMutation.isPending || removeReactionMutation.isPending;

    return (
        <div className="py-8 border-t border-[var(--color-border)] animate-fade-in">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[var(--color-brand-500)]" />
                    Reactions
                </h3>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Show top reactions as buttons */}
                    {displayReactions.slice(0, 3).map((reaction) => {
                        const Icon = getReactionIcon(reaction.name);
                        const isActive = reaction.my_reaction;

                        return (
                            <button
                                key={reaction.name}
                                onClick={() => handleReactionClick(reaction)}
                                disabled={isPending}
                                className={`
                                    group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                                    border-2 transition-all duration-200 select-none
                                    ${isActive
                                    ? "border-[var(--color-brand-500)] bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)] shadow-[var(--shadow-md)]"
                                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)] hover:bg-[var(--color-surface-elevated)] hover:shadow-[var(--shadow-sm)]"
                                }
                                    ${isPending
                                    ? "opacity-60 cursor-not-allowed"
                                    : "cursor-pointer active:scale-95"
                                }
                                `}
                                title={isActive ? `Remove ${reaction.name}` : `React with ${reaction.name}`}
                            >
                                <span className={`text-xl transition-transform duration-200 ${!isActive && !isPending ? "group-hover:scale-110" : ""}`}>
                                    {reaction.emoji}
                                </span>

                                {Icon && (
                                    <Icon
                                        className={`w-4 h-4 transition-colors ${
                                            isActive
                                                ? "text-[var(--color-brand-600)]"
                                                : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-500)]"
                                        }`}
                                    />
                                )}

                                <span
                                    className={`text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]"
                                            : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                                    }`}
                                >
                                    {reaction.count}
                                </span>

                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-brand-500)] rounded-full border-2 border-[var(--color-background)] animate-scale-in" />
                                )}
                            </button>
                        );
                    })}

                    {/* Dropdown for all reactions */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => {
                                if (!user) {
                                    navigate("/login", { state: { from: `/post/${slug}` } });
                                    return;
                                }
                                setIsOpen(!isOpen);
                            }}
                            disabled={isPending}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl
                                border-2 transition-all duration-200
                                ${isOpen
                                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/30 ring-4 ring-[var(--color-brand-500)]/10"
                                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)] hover:bg-[var(--color-surface-elevated)]"
                            }
                                ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            {myReaction ? (
                                <>
                                    <span className="text-xl">{myReaction.emoji}</span>
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {myReaction.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xl">😊</span>
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                        React
                                    </span>
                                </>
                            )}
                            <ChevronDown
                                className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                            <div className="absolute left-0 top-full mt-2 w-72 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden z-50 animate-slideDown">
                                <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                        {myReaction ? "Change or remove your reaction" : "Choose your reaction"}
                                    </p>
                                </div>

                                <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                    <div className="p-2 space-y-1">
                                        {allReactions.map((reaction) => {
                                            const isActive = reaction.my_reaction;
                                            const Icon = getReactionIcon(reaction.name);

                                            return (
                                                <button
                                                    key={reaction.name}
                                                    type="button"
                                                    onClick={() => handleReactionClick(reaction)}
                                                    disabled={isPending}
                                                    className={`
                                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                                        transition-all group
                                                        ${isActive
                                                        ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/30"
                                                        : "hover:bg-[var(--color-surface-elevated)]"
                                                    }
                                                        ${isPending ? "opacity-60" : "cursor-pointer active:scale-98"}
                                                    `}
                                                >
                                                    <span className={`text-2xl transition-transform ${!isActive ? "group-hover:scale-110" : ""}`}>
                                                        {reaction.emoji}
                                                    </span>

                                                    <div className="flex-1 text-left">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-medium ${
                                                                isActive
                                                                    ? "text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]"
                                                                    : "text-[var(--color-text-primary)]"
                                                            }`}>
                                                                {reaction.name}
                                                            </span>
                                                            {Icon && (
                                                                <Icon className={`w-3.5 h-3.5 ${
                                                                    isActive
                                                                        ? "text-[var(--color-brand-600)]"
                                                                        : "text-[var(--color-text-tertiary)]"
                                                                }`} />
                                                            )}
                                                        </div>
                                                        {reaction.count > 0 && (
                                                            <span className="text-xs text-[var(--color-text-tertiary)]">
                                                                {reaction.count} {reaction.count === 1 ? "reaction" : "reactions"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isActive && (
                                                        <div className="w-5 h-5 rounded-full bg-[var(--color-brand-500)] flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {totalReactions > 0 && (
                                    <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                                        <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]" />
                                            {totalReactions} total reaction{totalReactions !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {displayReactions.length === 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                        <div className="text-2xl">✨</div>
                        <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                Be the first to react!
                            </p>
                            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                {user ? "Click React to share your thoughts" : "Sign in to be the first to react"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}