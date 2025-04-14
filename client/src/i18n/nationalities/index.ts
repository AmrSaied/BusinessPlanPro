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

/**
 * Get all nationality translations for searching in any language
 * Returns a map of English country name to an array of translations in all available languages
 */
export function getAllNationalityTranslations(): Record<string, string[]> {
  const allTranslations: Record<string, string[]> = {};
  
  // Process each English country name
  Object.keys(nationalities_en).forEach(englishName => {
    const translations: string[] = [englishName]; // Start with English name
    
    // Add translations from each language
    if (nationalities_ar[englishName]) translations.push(nationalities_ar[englishName]);
    if (nationalities_es[englishName]) translations.push(nationalities_es[englishName]);
    if (nationalities_fr[englishName]) translations.push(nationalities_fr[englishName]);
    if (nationalities_ru[englishName]) translations.push(nationalities_ru[englishName]);
    
    // Remove duplicates by using a more compatible approach
    const uniqueTranslations: string[] = [];
    
    translations.forEach(translation => {
      // Only add if not already in the array
      if (!uniqueTranslations.includes(translation)) {
        uniqueTranslations.push(translation);
      }
    });
    
    allTranslations[englishName] = uniqueTranslations;
  });
  
  return allTranslations;
}

/**
 * Custom search function to match nationalities across all languages
 * Returns true if the search term matches any translation of the country in any language
 */
export function matchNationalityInAnyLanguage(
  englishName: string, 
  searchTerm: string
): boolean {
  if (!searchTerm) return true;
  
  const allTranslations = getAllNationalityTranslations();
  const countryTranslations = allTranslations[englishName] || [];
  
  // Case-insensitive search across all translations
  const searchTermLower = searchTerm.toLowerCase();
  return countryTranslations.some(translation => 
    translation.toLowerCase().includes(searchTermLower)
  );
}