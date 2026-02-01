// src/components/LanguageSwitcher.tsx
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage, type LanguageCode } from '../i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
    variant?: 'dropdown' | 'list' | 'compact';
    showLabel?: boolean;
    className?: string;
}

export default function LanguageSwitcher({ 
    variant = 'dropdown', 
    showLabel = true,
    className = '' 
}: LanguageSwitcherProps) {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code: LanguageCode) => {
        changeLanguage(code);
        setIsOpen(false);
    };

    // List variant - for settings pages
    if (variant === 'list') {
        return (
            <div className={`space-y-2 ${className}`}>
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`
                            w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                            ${i18n.language === lang.code
                                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20'
                                : 'border-[var(--color-border)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-surface-elevated)]'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="text-left">
                                <p className={`font-medium ${i18n.language === lang.code ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' : 'text-[var(--color-text-primary)]'}`}>
                                    {lang.nativeName}
                                </p>
                                <p className="text-sm text-[var(--color-text-tertiary)]">
                                    {lang.name}
                                </p>
                            </div>
                        </div>
                        {i18n.language === lang.code && (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-500)]">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        );
    }

    // Compact variant - for navbar
    if (variant === 'compact') {
        return (
            <div className={`relative ${className}`} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
                    title={t('profile.selectLanguage')}
                >
                    <Globe className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {currentLanguage.code.split('-')[0].toUpperCase()}
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-xl z-50 animate-fade-in overflow-hidden">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 transition-colors
                                    ${i18n.language === lang.code
                                        ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20'
                                        : 'hover:bg-[var(--color-surface-elevated)]'
                                    }
                                `}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className={`flex-1 text-left text-sm font-medium ${i18n.language === lang.code ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' : 'text-[var(--color-text-primary)]'}`}>
                                    {lang.nativeName}
                                </span>
                                {i18n.language === lang.code && (
                                    <Check className="w-4 h-4 text-[var(--color-brand-500)]" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default dropdown variant
    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-300)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] transition-all"
            >
                <span className="text-lg">{currentLanguage.flag}</span>
                {showLabel && (
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {currentLanguage.nativeName}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-xl z-50 animate-fade-in overflow-hidden">
                    <div className="p-2">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                    ${i18n.language === lang.code
                                        ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20'
                                        : 'hover:bg-[var(--color-surface-elevated)]'
                                    }
                                `}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <div className="flex-1 text-left">
                                    <p className={`text-sm font-medium ${i18n.language === lang.code ? 'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]' : 'text-[var(--color-text-primary)]'}`}>
                                        {lang.nativeName}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)]">
                                        {lang.name}
                                    </p>
                                </div>
                                {i18n.language === lang.code && (
                                    <Check className="w-4 h-4 text-[var(--color-brand-500)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
