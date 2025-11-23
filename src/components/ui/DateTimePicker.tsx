import React, { useState, useEffect, useRef } from "react";

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    minDate?: Date;
}

export default function DateTimePicker({ value, onChange, label, minDate }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState<Date>(value ? new Date(value) : new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(value ? new Date(value) : new Date());
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            const d = new Date(value);
            setDate(d);
            setCurrentMonth(d);
        }
    }, [value]);

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

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const previousMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const isDateTimeInPast = (testDate: Date): boolean => {
        const now = minDate || new Date();
        return testDate.getTime() < now.getTime();
    };

    const selectDate = (day: number) => {
        const newDate = new Date(year, month, day, date.getHours(), date.getMinutes(), 0);
        setDate(newDate);
    };

    const updateTime = (hours?: number, minutes?: number) => {
        const newDate = new Date(date);
        if (hours !== undefined) newDate.setHours(Math.max(0, Math.min(23, hours)));
        if (minutes !== undefined) newDate.setMinutes(Math.max(0, Math.min(59, minutes)));
        newDate.setSeconds(0);
        setDate(newDate);
    };

    const handleConfirm = () => {
        if (!isDateTimeInPast(date)) {
            onChange(date.toISOString());
            setIsOpen(false);
        }
    };

    const formatDisplayDate = () => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        const h = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${d} ${h}:${min}`;
    };

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysCount; day++) {
        const isSelected = date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
        const dayDate = new Date(year, month, day, 0, 0, 0);
        const now = minDate || new Date();
        const isDisabled = dayDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isToday = new Date().toDateString() === dayDate.toDateString();

        days.push(
            <button
                key={day}
                type="button"
                disabled={isDisabled}
                onClick={() => selectDate(day)}
                className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSelected
                        ? "bg-[var(--color-brand-600)] text-white shadow-md scale-105"
                        : !isDisabled
                            ? "hover:bg-[var(--color-surface-elevated)] hover:scale-105 text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-tertiary)] opacity-30 cursor-not-allowed line-through"
                } ${isToday && !isSelected && !isDisabled ? "ring-2 ring-[var(--color-brand-500)] ring-inset font-bold" : ""}`}
            >
                {day}
            </button>
        );
    }

    const isPastTime = isDateTimeInPast(date);

    return (
        <div className="space-y-2" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] tracking-wide">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-[var(--color-background)] text-left text-[var(--color-text-primary)] transition-all duration-200 flex items-center justify-between group ${
                        isOpen
                            ? "border-[var(--color-brand-500)] ring-4 ring-[var(--color-brand-500)]/10 shadow-lg"
                            : "border-[var(--color-border)] hover:border-[var(--color-brand-500)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-4 focus:ring-[var(--color-brand-500)]/10"
                    }`}
                >
                    <span className="font-mono text-sm">{formatDisplayDate()}</span>
                    <svg
                        className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-20 mt-2 w-full md:w-96 p-5 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl animate-scale-in origin-top">
                        <div className="flex items-center justify-between mb-5">
                            <button
                                type="button"
                                onClick={previousMonth}
                                className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] transition-all duration-200 hover:scale-110"
                                aria-label="Previous month"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="text-center">
                                <div className="font-bold text-lg text-[var(--color-text-primary)]">{monthNames[month]}</div>
                                <div className="text-sm text-[var(--color-text-secondary)] font-medium">{year}</div>
                            </div>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] transition-all duration-200 hover:scale-110"
                                aria-label="Next month"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-3">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                                <div key={day} className="h-8 flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-5">
                            {days}
                        </div>

                        <div className="border-t-2 border-[var(--color-border)] pt-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[var(--color-brand-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    Time (24h format)
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs text-[var(--color-text-tertiary)] font-semibold uppercase tracking-wide">HH</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={String(date.getHours()).padStart(2, "0")}
                                        onChange={(e) => updateTime(Number(e.target.value))}
                                        className="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all text-center font-mono font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-[var(--color-text-tertiary)] font-semibold uppercase tracking-wide">MM</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={String(date.getMinutes()).padStart(2, "0")}
                                        onChange={(e) => updateTime(undefined, Number(e.target.value))}
                                        className="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all text-center font-mono font-bold text-lg"
                                    />
                                </div>
                            </div>

                            {isPastTime && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)]">
                                    <svg className="w-4 h-4 text-[var(--color-warning-text)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-xs text-[var(--color-warning-text)] font-medium">
                                        Selected time is in the past
                                    </span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isPastTime}
                                className={`w-full mt-4 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                    isPastTime
                                        ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed opacity-60"
                                        : "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)] text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                }`}
                            >
                                {isPastTime ? "Cannot select past time" : "Confirm Selection"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}