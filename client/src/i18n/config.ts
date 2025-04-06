import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supportedLanguages } from './languages';
import enTranslation from './translations/en';
import esTranslation from './translations/es';
import arTranslation from './translations/ar';

// Add all the languages initial resources
const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  },
  ar: {
    translation: arTranslation
  }
  // Other languages will be loaded dynamically
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: Object.keys(supportedLanguages),
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Function to dynamically load language resources
export const loadLanguageAsync = async (language: string) => {
  if (i18n.hasResourceBundle(language, 'translation')) {
    return Promise.resolve();
  }

  try {
    console.log(`Loading language: ${language}`);
    
    // For languages that we've already imported at compile time,
    // we just mark them as resolved
    if (['en', 'es', 'ar'].includes(language)) {
      return Promise.resolve();
    }
    
    // For other languages, we would dynamically import them
    // In a real production app, we might fetch these from the server
    // or use dynamic imports like this:
    try {
      const module = await import(`./translations/${language}.ts`);
      i18n.addResourceBundle(language, 'translation', module.default);
    } catch (e) {
      // Fallback - create a basic translation with just the language name
      i18n.addResourceBundle(language, 'translation', {
        ...enTranslation,
        language_name: supportedLanguages[language].nativeName
      });
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error(`Error loading language ${language}:`, error);
    return Promise.reject(error);
  }
};

export default i18n;
