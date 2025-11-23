// src/components/CommentsSection.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { listComments, createComment, deleteComment, updateComment, fetchReplies, likeComment, dislikeComment } from "../services/comments";
import type { Comment } from "../types/comment";
import ConfirmDialog from "./ConfirmDialog";
import Dropdown from "./ui/Dropdown";

type CommentsSectionProps = {
    postSlug: string;
};

type SortOption = "newest" | "oldest" | "most_liked";

const PAGE_SIZE_OPTIONS = [
    { label: "10 per page", value: "10" },
    { label: "20 per page", value: "20" },
    { label: "50 per page", value: "50" },
];

export default function CommentsSection({ postSlug }: CommentsSectionProps) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [showSortMenu, setShowSortMenu] = useState(false);
    const { user } = useCurrentUser();

    const getOrdering = () => {
        switch (sortBy) {
            case "newest": return "-created_at";
            case "oldest": return "created_at";
            case "most_liked": return "-likes";
            default: return "-created_at";
        }
    };

    const { data: commentsData, isLoading, isError } = useQuery({
        queryKey: ["comments", postSlug, page, pageSize, sortBy],
        queryFn: () => listComments(postSlug, { page, page_size: pageSize, ordering: getOrdering() }),
        staleTime: 30000,
    });

    const totalComments = commentsData?.total_comments || 0;
    const comments = commentsData?.results || [];
    const totalPages = commentsData ? Math.ceil(commentsData.count / pageSize) : 1;

    const handlePageSizeChange = (value: string) => {
        setPageSize(parseInt(value, 10));
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
    };

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("ellipsis");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 2) pages.push("ellipsis");
            if (totalPages > 1) pages.push(totalPages);
        }
        return pages;
    };

    const pageOptions = Array.from({ length: totalPages }, (_, i) => ({
        label: `Page ${i + 1}`,
        value: String(i + 1),
    }));

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-6">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                    Comments
                    <span className="ml-2 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[var(--color-brand-500)] text-white text-sm font-medium">
                        {totalComments}
                    </span>
                </h2>

                <div className="relative">
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                        <SortIcon />
                        {sortBy === "newest" ? "Most recent" : sortBy === "oldest" ? "Oldest first" : "Top"}
                        <ChevronDownIcon />
                    </button>

                    {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                            <div className="absolute top-full left-0 mt-2 py-1 w-40 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-lg z-20">
                                <button onClick={() => { setSortBy("newest"); setShowSortMenu(false); setPage(1); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface)] transition-colors ${sortBy === "newest" ? "text-[var(--color-brand-500)] font-medium" : "text-[var(--color-text-primary)]"}`}>Most recent</button>
                                <button onClick={() => { setSortBy("oldest"); setShowSortMenu(false); setPage(1); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface)] transition-colors ${sortBy === "oldest" ? "text-[var(--color-brand-500)] font-medium" : "text-[var(--color-text-primary)]"}`}>Oldest first</button>
                                <button onClick={() => { setSortBy("most_liked"); setShowSortMenu(false); setPage(1); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface)] transition-colors ${sortBy === "most_liked" ? "text-[var(--color-brand-500)] font-medium" : "text-[var(--color-text-primary)]"}`}>Top</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {user ? <CommentForm postSlug={postSlug} /> : <LoginPrompt />}

            <div className="border-t border-[var(--color-border)]" />

            {isLoading && <LoadingSkeleton />}

            {isError && (
                <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 mb-3">
                        <AlertIcon />
                    </div>
                    <p className="text-[var(--color-text-secondary)]">Failed to load comments. Please try again.</p>
                </div>
            )}

            {!isLoading && !isError && comments.length === 0 && (
                <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-elevated)] mb-4">
                        <ChatIcon className="w-7 h-7 text-[var(--color-text-tertiary)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">No comments yet</h3>
                    <p className="text-[var(--color-text-secondary)]">Be the first to share your thoughts!</p>
                </div>
            )}

            {!isLoading && !isError && comments.length > 0 && (
                <div className="space-y-0">
                    {comments.map((comment) => (
                        <CommentThread key={comment.id} comment={comment} postSlug={postSlug} />
                    ))}
                </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages >= 1 && !isLoading && !isError && comments.length > 0 && (
                <div className="pt-6 border-t border-[var(--color-border)]">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-[var(--color-text-tertiary)]">
                            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, commentsData?.count || 0)} of {commentsData?.count || 0} comments
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Previous page">
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>

                            <div className="hidden sm:flex items-center gap-1">
                                {getPageNumbers().map((p, idx) =>
                                    p === "ellipsis" ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-[var(--color-text-tertiary)]">…</span>
                                    ) : (
                                        <button key={p} onClick={() => handlePageChange(p)} className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${page === p ? "bg-[var(--color-brand-500)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"}`}>
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>

                            <div className="sm:hidden w-32">
                                <Dropdown options={pageOptions} value={String(page)} onChange={(val) => handlePageChange(parseInt(val, 10))} placeholder="Page" />
                            </div>

                            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Next page">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-36">
                            <Dropdown options={PAGE_SIZE_OPTIONS} value={String(pageSize)} onChange={handlePageSizeChange} />
                        </div>
                    </div>

                    {totalPages > 10 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <span className="text-sm text-[var(--color-text-tertiary)]">Jump to:</span>
                            <div className="w-28">
                                <Dropdown options={pageOptions} value={String(page)} onChange={(val) => handlePageChange(parseInt(val, 10))} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

/* ===================== CommentThread ===================== */
type CommentThreadProps = { comment: Comment; postSlug: string };

function CommentThread({ comment, postSlug }: CommentThreadProps) {
    const [showReplies, setShowReplies] = useState(false);
    const queryClient = useQueryClient();

    const { data: replies, isLoading: isLoadingReplies, isError: repliesError, refetch } = useQuery({
        queryKey: ["replies", postSlug, comment.id],
        queryFn: () => fetchReplies(postSlug, comment.id),
        enabled: showReplies,
        staleTime: 30000,
    });

    const replyCount = comment.reply_count || 0;
    const hasReplies = replyCount > 0 || (replies && replies.length > 0);
    const displayCount = (replies && replies.length > 0) ? replies.length : replyCount;

    const handleToggleReplies = () => setShowReplies(!showReplies);

    const handleReplyAdded = () => {
        setShowReplies(true);
        queryClient.invalidateQueries({ queryKey: ["replies", postSlug, comment.id] });
        queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    };

    return (
        <div className="py-4 first:pt-0">
            <CommentItem comment={comment} postSlug={postSlug} isReply={false} onReplyAdded={handleReplyAdded} />

            {(hasReplies || displayCount > 0) && (
                <div className="ml-12 md:ml-14 mt-2">
                    <button onClick={handleToggleReplies} disabled={isLoadingReplies} className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-full text-sm font-semibold text-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/10 transition-colors disabled:opacity-70">
                        {isLoadingReplies ? (
                            <><LoadingSpinner />Loading...</>
                        ) : (
                            <><ChevronIcon className={`w-4 h-4 transition-transform duration-200 ${showReplies ? "rotate-180" : ""}`} />{showReplies ? "Hide" : "View"} {displayCount} {displayCount === 1 ? "reply" : "replies"}</>
                        )}
                    </button>
                    {repliesError && <button onClick={() => refetch()} className="mt-1 ml-1 text-xs text-red-500 hover:underline">Failed to load replies. Click to retry.</button>}
                </div>
            )}

            {showReplies && replies && replies.length > 0 && (
                <div className="ml-12 md:ml-14 mt-2 pl-4 border-l-2 border-[var(--color-border)] animate-slideDown">
                    {replies.map((reply) => (
                        <ReplyThread key={reply.id} reply={reply} postSlug={postSlug} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ===================== ReplyThread ===================== */
type ReplyThreadProps = { reply: Comment; postSlug: string };

function ReplyThread({ reply, postSlug }: ReplyThreadProps) {
    const [showNested, setShowNested] = useState(false);
    const queryClient = useQueryClient();

    const { data: nestedReplies, isLoading, isError, refetch } = useQuery({
        queryKey: ["replies", postSlug, reply.id],
        queryFn: () => fetchReplies(postSlug, reply.id),
        enabled: showNested,
        staleTime: 30000,
    });

    const nestedCount = reply.reply_count || 0;
    const hasNested = nestedCount > 0 || (nestedReplies && nestedReplies.length > 0);
    const displayCount = (nestedReplies && nestedReplies.length > 0) ? nestedReplies.length : nestedCount;

    const handleToggle = () => setShowNested(!showNested);

    const handleReplyAdded = () => {
        setShowNested(true);
        queryClient.invalidateQueries({ queryKey: ["replies", postSlug, reply.id] });
        queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
    };

    return (
        <div className="py-3 first:pt-2">
            <CommentItem comment={reply} postSlug={postSlug} isReply={true} onReplyAdded={handleReplyAdded} />

            {(hasNested || displayCount > 0) && (
                <div className="mt-2 ml-11">
                    <button onClick={handleToggle} disabled={isLoading} className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-full text-xs font-semibold text-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/10 transition-colors disabled:opacity-70">
                        {isLoading ? (
                            <><LoadingSpinner />Loading...</>
                        ) : (
                            <><ChevronIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${showNested ? "rotate-180" : ""}`} />{showNested ? "Hide" : "View"} {displayCount} {displayCount === 1 ? "reply" : "replies"}</>
                        )}
                    </button>
                    {isError && <button onClick={() => refetch()} className="mt-1 ml-1 text-xs text-red-500 hover:underline">Failed to load. Click to retry.</button>}
                </div>
            )}

            {showNested && nestedReplies && nestedReplies.length > 0 && (
                <div className="mt-2 ml-11 pl-4 border-l-2 border-[var(--color-border)] animate-slideDown">
                    {nestedReplies.map((nested) => (
                        <ReplyThread key={nested.id} reply={nested} postSlug={postSlug} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ===================== CommentItem ===================== */
type CommentItemProps = { comment: Comment; postSlug: string; isReply: boolean; onReplyAdded?: () => void };

function CommentItem({ comment, postSlug, isReply, onReplyAdded }: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { user } = useCurrentUser();
    const queryClient = useQueryClient();

    const invalidateAllComments = () => {
        queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "replies" && query.queryKey[1] === postSlug });
    };

    const deleteMutation = useMutation({
        mutationFn: () => deleteComment(postSlug, comment.id),
        onSuccess: () => { invalidateAllComments(); setShowDeleteConfirm(false); },
    });

    const editMutation = useMutation({
        mutationFn: (content: string) => updateComment(postSlug, comment.id, { content }),
        onSuccess: (updatedComment) => {
            queryClient.setQueryData<Comment[]>(["replies", postSlug, comment.parent], (old) => old?.map(c => c.id === comment.id ? { ...c, ...updatedComment } : c));
            invalidateAllComments();
            setIsEditing(false);
        },
    });

    const likeMutation = useMutation({
        mutationFn: () => likeComment(postSlug, comment.id),
        onSuccess: () => invalidateAllComments(),
    });

    const dislikeMutation = useMutation({
        mutationFn: () => dislikeComment(postSlug, comment.id),
        onSuccess: () => invalidateAllComments(),
    });

    const getAuthorInitials = (author: Comment["author"]) => {
        if (!author) return "?";
        const first = author.first_name?.[0] || "";
        const last = author.last_name?.[0] || "";
        return (first + last).toUpperCase() || author.email?.[0]?.toUpperCase() || "?";
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffWeeks < 4) return `${diffWeeks}w ago`;
        if (diffMonths < 12) return `${diffMonths}mo ago`;
        return `${diffYears}y ago`;
    };

    const handleDelete = () => { setShowMenu(false); setShowDeleteConfirm(true); };
    const handleEdit = () => { setShowMenu(false); setEditContent(comment.content); setIsEditing(true); };
    const handleEditSubmit = () => {
        if (!editContent.trim() || editContent.trim() === comment.content) { setIsEditing(false); return; }
        editMutation.mutate(editContent.trim());
    };
    const handleEditCancel = () => { setIsEditing(false); setEditContent(comment.content); };

    const canModify = user && comment.author && user.id === comment.author.id;

    return (
        <div className="flex gap-3">
            <div className="flex-shrink-0">
                <div className={`${isReply ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-semibold`}>
                    {getAuthorInitials(comment.author)}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--color-text-primary)] text-sm">{comment.author?.full_name || "Unknown User"}</span>
                    <span className="text-xs text-[var(--color-text-tertiary)]">{getRelativeTime(comment.created_at)}</span>
                    {comment.is_edited && <span className="text-xs text-[var(--color-text-tertiary)] italic">(edited)</span>}
                </div>

                {isEditing ? (
                    <div className="mt-2">
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full px-3 py-2 bg-transparent border-2 border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] text-sm leading-relaxed focus:outline-none focus:border-[var(--color-brand-500)] transition-colors resize-none" rows={3} autoFocus disabled={editMutation.isPending} onKeyDown={(e) => { if (e.key === "Escape") handleEditCancel(); }} />
                        {editMutation.isError && <p className="mt-1 text-xs text-red-500">Failed to update. Please try again.</p>}
                        <div className="mt-2 flex items-center justify-end gap-2">
                            <button onClick={handleEditCancel} disabled={editMutation.isPending} className="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors">Cancel</button>
                            <button onClick={handleEditSubmit} disabled={!editContent.trim() || editMutation.isPending} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{editMutation.isPending ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1 text-[var(--color-text-primary)] text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
                )}

                {!isEditing && (
                    <div className="mt-2 flex items-center gap-1 -ml-2">
                        <button onClick={() => user && likeMutation.mutate()} disabled={!user || likeMutation.isPending} className={`flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors ${!user ? "text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50" : comment.user_reaction === "LIKE" ? "text-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10 hover:bg-[var(--color-brand-500)]/20" : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"} ${likeMutation.isPending ? "opacity-50" : ""}`} title={!user ? "Sign in to like" : "Like"}>
                            <ThumbUpIcon className="w-4 h-4" filled={comment.user_reaction === "LIKE"} />
                            <span className="text-xs font-medium">{comment.likes || 0}</span>
                        </button>
                        <button onClick={() => user && dislikeMutation.mutate()} disabled={!user || dislikeMutation.isPending} className={`flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors ${!user ? "text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50" : comment.user_reaction === "DISLIKE" ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"} ${dislikeMutation.isPending ? "opacity-50" : ""}`} title={!user ? "Sign in to dislike" : "Dislike"}>
                            <ThumbDownIcon className="w-4 h-4" filled={comment.user_reaction === "DISLIKE"} />
                            <span className="text-xs font-medium">{comment.dislikes || 0}</span>
                        </button>
                        {user && (
                            <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] transition-colors">
                                <ReplyIcon className="w-3.5 h-3.5" />Reply
                            </button>
                        )}
                        <div className="relative ml-auto">
                            <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] transition-colors">
                                <MoreIcon className="w-4 h-4" />
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-full mt-1 py-1 w-36 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-lg z-20">
                                        {canModify && (
                                            <>
                                                <button onClick={handleEdit} className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors flex items-center gap-2"><EditIcon className="w-4 h-4" />Edit</button>
                                                <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-[var(--color-surface)] transition-colors flex items-center gap-2"><TrashIcon className="w-4 h-4" />Delete</button>
                                            </>
                                        )}
                                        <button onClick={() => setShowMenu(false)} className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors flex items-center gap-2"><FlagIcon className="w-4 h-4" />Report</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {showReplyForm && (
                    <div className="mt-3">
                        <CommentForm postSlug={postSlug} parentId={comment.id} onSuccess={() => { setShowReplyForm(false); onReplyAdded?.(); }} onCancel={() => setShowReplyForm(false)} compact autoFocus />
                    </div>
                )}
            </div>

            <ConfirmDialog open={showDeleteConfirm} title="Delete comment?" description="This action cannot be undone. Your comment will be permanently removed." confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"} cancelText="Cancel" onConfirm={() => deleteMutation.mutate()} onClose={() => setShowDeleteConfirm(false)} danger />
        </div>
    );
}

/* ===================== CommentForm ===================== */
type CommentFormProps = { postSlug: string; parentId?: number; onSuccess?: () => void; onCancel?: () => void; compact?: boolean; autoFocus?: boolean };

function CommentForm({ postSlug, parentId, onSuccess, onCancel, compact, autoFocus }: CommentFormProps) {
    const [content, setContent] = useState("");
    const [isFocused, setIsFocused] = useState(autoFocus || false);
    const { user } = useCurrentUser();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (body: { parent?: number; content: string }) => createComment(postSlug, body),
        onSuccess: () => {
            setContent("");
            setIsFocused(false);
            queryClient.invalidateQueries({ queryKey: ["comments", postSlug] });
            if (parentId) queryClient.invalidateQueries({ queryKey: ["replies", postSlug, parentId] });
            onSuccess?.();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        mutation.mutate({ content: content.trim(), ...(parentId ? { parent: parentId } : {}) });
    };

    const getAuthorInitials = () => {
        if (!user) return "?";
        const first = user.first_name?.[0] || "";
        const last = user.last_name?.[0] || "";
        return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
    };

    const showActions = isFocused || content.trim().length > 0;

    return (
        <div className="flex gap-3">
            <div className="flex-shrink-0">
                <div className={`${compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"} rounded-full bg-gradient-to-br from-[var(--color-brand-400)] to-[var(--color-brand-600)] flex items-center justify-center text-white font-semibold`}>{getAuthorInitials()}</div>
            </div>
            <div className="flex-1">
                <input type="text" value={content} onChange={(e) => setContent(e.target.value)} onFocus={() => setIsFocused(true)} placeholder={parentId ? "Add a reply..." : "Share your thoughts..."} autoFocus={autoFocus} className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-[var(--color-border)] text-[var(--color-text-primary)] text-sm placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-colors" disabled={mutation.isPending} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } if (e.key === "Escape") { setIsFocused(false); onCancel?.(); } }} />
                {mutation.isError && <p className="mt-2 text-xs text-red-500">Failed to post comment. Please try again.</p>}
                {showActions && (
                    <div className="mt-3 flex items-center justify-end gap-2">
                        <button type="button" onClick={() => { setContent(""); setIsFocused(false); onCancel?.(); }} className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors">Cancel</button>
                        <button onClick={handleSubmit} disabled={!content.trim() || mutation.isPending} className="px-4 py-2 rounded-full text-sm font-semibold bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{mutation.isPending ? <span className="flex items-center gap-2"><LoadingSpinner />Posting...</span> : parentId ? "Reply" : "Post Comment"}</button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ===================== LoginPrompt ===================== */
function LoginPrompt() {
    return (
        <div className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center text-[var(--color-text-tertiary)]"><UserIcon className="w-5 h-5" /></div>
            <div className="flex-1">
                <p className="text-sm text-[var(--color-text-secondary)]">
                    <Link to="/login" className="text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] font-semibold">Sign in</Link> to join the conversation
                </p>
            </div>
        </div>
    );
}

/* ===================== LoadingSkeleton ===================== */
function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-elevated)]" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-[var(--color-surface-elevated)] rounded" />
                        <div className="h-4 w-full bg-[var(--color-surface-elevated)] rounded" />
                        <div className="h-4 w-2/3 bg-[var(--color-surface-elevated)] rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ===================== Icons ===================== */
function SortIcon() {
    return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>;
}
function ChevronDownIcon() {
    return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;
}
function ChevronLeftIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
}
function ChevronRightIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
}
function ThumbUpIcon({ className, filled }: { className?: string; filled?: boolean }) {
    if (filled) return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/></svg>;
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>;
}
function ThumbDownIcon({ className, filled }: { className?: string; filled?: boolean }) {
    if (filled) return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12c-.11.25-.17.52-.17.8V13c0 1.1.9 2 2 2h5.5l-.92 4.65c-.05.22-.02.46.08.66.23.45.52.86.88 1.22L10 22l6.41-6.41c.38-.38.59-.89.59-1.42V6.34C17 5.05 15.95 4 14.66 4h-8.1c-.71 0-1.36.37-1.72.97l-2.67 6.15z"/></svg>;
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>;
}
function ReplyIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
}
function MoreIcon({ className }: { className?: string }) {
    return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}
function EditIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function FlagIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
}
function AlertIcon() {
    return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ChatIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
}
function UserIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
function LoadingSpinner() {
    return <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
}