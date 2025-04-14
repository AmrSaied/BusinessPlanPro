import { supportedLanguages } from '../languages';

export type Language = keyof typeof supportedLanguages;
import nationalities_en from './en';
import nationalities_ar from './ar';
import nationalities_es from './es';
import nationalities_fr from './fr';
import nationalities_ru from './ru';
// Add other language imports as they become available

export type NationalityTranslations = Record<string, string>;

/**
 * Get nationalities translations by language code
 */
export function getNationalitiesForLanguage(language: Language): NationalityTranslations {
  switch (language) {
    case 'en': return nationalities_en;
    case 'ar': return nationalities_ar;
    case 'es': return nationalities_es;
    case 'fr': return nationalities_fr;
    case 'ru': return nationalities_ru;
    // Add other languages as they become available
    default: return nationalities_en; // Fallback to English
  }
}