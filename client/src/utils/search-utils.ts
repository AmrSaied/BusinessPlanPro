/**
 * Utilities for enhanced multi-language search
 */

/**
 * Normalize Arabic text by removing diacritics and special marks
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  
  // Remove Arabic diacritics (harakaat), tatweel, and other special marks
  return text.replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, '');
}

/**
 * Remove diacritics from Latin-based text
 * This helps with searching text with accents like é, è, à, etc.
 */
export function removeDiacritics(text: string): string {
  if (!text) return '';
  
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize text for search:
 * - Convert to lowercase
 * - Remove diacritics from Latin scripts
 * - Normalize Arabic text
 * - Trim whitespace
 */
export function normalizeForSearch(text: string): string {
  if (!text) return '';
  
  // First lowercase and trim
  let normalized = text.toLowerCase().trim();
  
  // Then remove diacritics from Latin scripts
  normalized = removeDiacritics(normalized);
  
  // If contains Arabic characters, apply Arabic normalization
  if (/[\u0600-\u06FF]/.test(normalized)) {
    normalized = normalizeArabic(normalized);
  }
  
  return normalized;
}

/**
 * Performs a fuzzy search across strings in multiple languages
 */
export function multiLanguageSearch(
  items: Array<{value: string; label: string; englishName?: string}>, 
  query: string,
  options: {
    enableFuzzy?: boolean; // Whether to use fuzzy matching (allows typos)
    threshold?: number;    // Match threshold for fuzzy search, 0-1 (1 = exact match)
  } = {}
): Array<{value: string; label: string; englishName?: string}> {
  if (!query || query.trim() === '') {
    return items; // Return all items if query is empty
  }
  
  const normalizedQuery = normalizeForSearch(query);
  
  return items.filter(item => {
    // Normalize the strings for matching
    const normalizedLabel = normalizeForSearch(item.label);
    const normalizedEnglishName = item.englishName ? normalizeForSearch(item.englishName) : '';
    
    // Check if either field contains the query
    return normalizedLabel.includes(normalizedQuery) || 
           normalizedEnglishName.includes(normalizedQuery);
  });
}