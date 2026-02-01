// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './locales/en.json';
import ru from './locales/ru.json';
import uzLatin from './locales/uz-Latn.json';
import uzCyrillic from './locales/uz-Cyrl.json';

// Supported languages
export const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'uz-Latn', name: 'Uzbek (Latin)', nativeName: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'uz-Cyrl', name: 'Uzbek (Cyrillic)', nativeName: 'Ўзбекча', flag: '🇺🇿' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

// Resources
const resources = {
    en: { translation: en },
    ru: { translation: ru },
    'uz-Latn': { translation: uzLatin },
    'uz-Cyrl': { translation: uzCyrillic },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: import.meta.env.DEV,
        
        interpolation: {
            escapeValue: false, // React already does escaping
        },
        
        detection: {
            // Order and from where user language should be detected
            order: ['localStorage', 'navigator', 'htmlTag'],
            // Keys to lookup language from
            lookupLocalStorage: 'i18nextLng',
            // Cache user language in localStorage
            caches: ['localStorage'],
        },
    });

// Function to change language
export const changeLanguage = (lng: LanguageCode) => {
    i18n.changeLanguage(lng);
    // Update document direction for RTL languages if needed in future
    document.documentElement.lang = lng;
};

// Get current language
export const getCurrentLanguage = (): LanguageCode => {
    return (i18n.language || 'en') as LanguageCode;
};

export default i18n;
