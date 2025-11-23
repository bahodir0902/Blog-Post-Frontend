// src/components/posts/ReactionTypePicker.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAvailableReactions } from "../../services/reactions";
import { Heart, ChevronDown, Check } from "lucide-react";

interface ReactionTypePickerProps {
    selectedReactionIds: number[];
    onChange: (ids: number[]) => void;
}

export function ReactionTypePicker({ selectedReactionIds, onChange }: ReactionTypePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { data: reactionTypes, isLoading, isError } = useQuery({
        queryKey: ["available-reactions"],
        queryFn: listAvailableReactions,
        staleTime: 10 * 60 * 1000,
    });
    // Initialize with all reactions selected by default (stable deps)
    useEffect(() => {
        if (reactionTypes && selectedReactionIds.length === 0) {
            onChange(reactionTypes.map(r => r.id));
        }
    }, [reactionTypes, onChange]);
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
    const toggleReaction = useCallback((id: number) => {
        const newSelected = selectedReactionIds.includes(id)
            ? selectedReactionIds.filter(rid => rid !== id)
            : [...selectedReactionIds, id];
        onChange(newSelected);
    }, [selectedReactionIds, onChange]);
    const toggleAll = useCallback(() => {
        if (!reactionTypes) return;
        const allIds = reactionTypes.map(r => r.id);
        const isAllSelected = allIds.length === selectedReactionIds.length &&
            allIds.every(id => selectedReactionIds.includes(id));
        onChange(isAllSelected ? [] : [...allIds]);
    }, [reactionTypes, selectedReactionIds, onChange]);
    if (isLoading) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
                    Allowed Reactions
                </label>
                <div className="w-full h-12 skeleton rounded-xl" />
            </div>
        );
    }
    if (isError || !reactionTypes) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
                    Allowed Reactions
                </label>
                <p className="text-sm text-[var(--color-error)]">Failed to load reaction types</p>
            </div>
        );
    }
    const allSelected = reactionTypes.length > 0 &&
        selectedReactionIds.length === reactionTypes.length &&
        reactionTypes.every(r => selectedReactionIds.includes(r.id));
    const selectedEmojis = reactionTypes
        .filter(r => selectedReactionIds.includes(r.id))
        .map(r => r.emoji)
        .slice(0, 5);
    return (
        <div className="space-y-2 animate-fade-in relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[var(--color-brand-500)]" />
                <label className="block text-sm font-semibold text-[var(--color-text-primary)]">
                    Allowed Reactions
                </label>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)]">
                Choose which reactions readers can use. All are enabled by default.
            </p>
            {/* Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl
                    border-2 transition-all bg-[var(--color-background)]
                    ${isOpen
                    ? "border-[var(--color-brand-500)] ring-4 ring-[var(--color-brand-500)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-brand-400)]"
                }
                `}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selectedReactionIds.length === 0 ? (
                        <span className="text-[var(--color-text-tertiary)] text-sm">
                            No reactions allowed
                        </span>
                    ) : (
                        <>
                            <div className="flex items-center gap-1">
                                {selectedEmojis.map((emoji, idx) => (
                                    <span key={idx} className="text-lg">{emoji}</span>
                                ))}
                                {selectedReactionIds.length > 5 && (
                                    <span className="text-xs text-[var(--color-text-tertiary)] ml-1">
                                        +{selectedReactionIds.length - 5} more
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-[var(--color-text-secondary)] ml-2">
                                {allSelected ? "All reactions" : `${selectedReactionIds.length} selected`}
                            </span>
                        </>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-[var(--color-text-tertiary)] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>
            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden animate-slideDown">
                    {/* Header with Select All */}
                    <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleAll();
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--color-background)] transition-colors group"
                        >
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                {allSelected ? "Deselect All" : "Select All"}
                            </span>
                            <div className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                ${allSelected
                                ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)]"
                                : "border-[var(--color-border)] group-hover:border-[var(--color-brand-400)]"
                            }
                            `}>
                                {allSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                        </button>
                    </div>
                    {/* Scrollable List */}
                    <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {reactionTypes.map((reaction) => {
                            const isSelected = selectedReactionIds.includes(reaction.id);
                            return (
                                <button
                                    key={reaction.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleReaction(reaction.id);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                        transition-all group
                                        ${isSelected
                                        ? "bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20"
                                        : "hover:bg-[var(--color-surface-elevated)]"
                                    }
                                    `}
                                >
                                    <span className="text-2xl flex-shrink-0">{reaction.emoji}</span>
                                    <span className={`
                                        flex-1 text-left text-sm font-medium transition-colors
                                        ${isSelected
                                        ? "text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]"
                                        : "text-[var(--color-text-primary)]"
                                    }
                                    `}>
                                        {reaction.name}
                                    </span>
                                    <div className={`
                                        w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
                                        ${isSelected
                                        ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)]"
                                        : "border-[var(--color-border)] group-hover:border-[var(--color-brand-400)]"
                                    }
                                    `}>
                                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {/* Footer */}
                    <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                        <p className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-500)]" />
                            {selectedReactionIds.length} of {reactionTypes.length} reactions enabled
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}