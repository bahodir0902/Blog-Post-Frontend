import { useRef, useEffect } from "react";

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
}

export default function OtpInput({ length = 6, value, onChange, autoFocus = false }: OtpInputProps) {
    const refs = useRef<HTMLInputElement[]>([]);
    const arr = Array.from({ length }, (_, i) => i);

    useEffect(() => {
        if (autoFocus && refs.current[0]) {
            refs.current[0].focus();
        }
    }, [autoFocus]);

    const setChar = (i: number, ch: string) => {
        const next = value.split("");
        next[i] = ch.replace(/\D/g, "").slice(-1);
        const joined = next.join("");
        onChange(joined);

        if (ch && i < length - 1) {
            refs.current[i + 1]?.focus();
        }
    };

    const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!value[i] && i > 0) {
                refs.current[i - 1]?.focus();
            } else {
                const next = value.split("");
                next[i] = "";
                onChange(next.join(""));
            }
        } else if (e.key === "ArrowLeft" && i > 0) {
            refs.current[i - 1]?.focus();
        } else if (e.key === "ArrowRight" && i < length - 1) {
            refs.current[i + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        onChange(pastedData);

        const nextEmpty = pastedData.length < length ? pastedData.length : length - 1;
        refs.current[nextEmpty]?.focus();
    };

    return (
        <div className="flex gap-3 justify-center">
            {arr.map((i) => (
                <input
                    key={i}
                    value={value[i] ?? ""}
                    inputMode="numeric"
                    onChange={(e) => setChar(i, e.target.value)}
                    onKeyDown={(e) => handleKey(i, e)}
                    onPaste={handlePaste}
                    ref={(el) => (refs.current[i] = el!)}
                    className="
            w-14 h-16 text-center text-2xl font-bold
            rounded-xl border-2 border-[var(--color-border)]
            bg-[var(--color-surface)]
            text-[var(--color-text-primary)]
            transition-all duration-300
            focus:outline-none
            focus:border-[var(--color-brand-500)]
            focus:shadow-lg
            focus:scale-110
            hover:border-[var(--color-border-strong)]
          "
                    maxLength={1}
                    autoComplete="off"
                />
            ))}
        </div>
    );
}