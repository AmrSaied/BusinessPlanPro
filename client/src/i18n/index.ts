import en from './translations/en';

// Define all available languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'ru' | 'pt' | 'hi' | 'ja';

// Translations container
const translations: Record<Language, typeof en> = {
  en,
  // Other languages would be imported and added here
  es: en, // Fallback to English for now
  fr: en,
  de: en,
  zh: en,
  ar: en,
  ru: en,
  pt: en,
  hi: en,
  ja: en
};

// Available languages for UI
export const availableLanguages = [
  { code: 'en' as Language, name: 'English' },
  { code: 'es' as Language, name: 'Español' },
  { code: 'fr' as Language, name: 'Français' },
  { code: 'de' as Language, name: 'Deutsch' },
  { code: 'zh' as Language, name: '中文' },
  { code: 'ar' as Language, name: 'العربية' },
  { code: 'ru' as Language, name: 'Русский' },
  { code: 'pt' as Language, name: 'Português' },
  { code: 'hi' as Language, name: 'हिन्दी' },
  { code: 'ja' as Language, name: '日本語' }
];

/**
 * Get translation for a key in specified language
 * @param key The translation key
 * @param language Target language
 * @returns Translated string or key if not found
 */
export function getTranslation(key: string, language: Language = 'en'): string {
  const translation = translations[language];
  // Return the translation or fallback to English or the key itself
  return (translation && (key in translation)) 
    ? translation[key as keyof typeof translation] as string
    : (language !== 'en' && translations.en[key as keyof typeof en]) 
      ? translations.en[key as keyof typeof en] as string
      : key;
}

// Detect browser language
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0] as Language;
  return availableLanguages.some(lang => lang.code === browserLang) 
    ? browserLang 
    : 'en';
}