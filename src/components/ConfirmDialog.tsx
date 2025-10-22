// src/components/ConfirmDialog.tsx
import React from "react";
import { X } from "lucide-react";

type Props = {
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    danger?: boolean;
};

export default function ConfirmDialog({
                                          open,
                                          title,
                                          description,
                                          confirmText = "Confirm",
                                          cancelText = "Cancel",
                                          onConfirm,
                                          onClose,
                                          danger,
                                      }: Props) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl animate-scale-in">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {description && (
                            <p className="mt-1 text-[var(--color-text-secondary)] text-sm">{description}</p>
                        )}
                    </div>
                    <button
                        className="rounded-lg p-1.5 hover:bg-[var(--color-surface-elevated)]"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border bg-[var(--color-surface)] border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] focus-ring"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white focus-ring ${
                            danger
                                ? "bg-[var(--color-error)] hover:opacity-90"
                                : "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)]"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
