import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supportedLanguages } from './languages';
import enTranslation from './translations/en';

// Add all the languages initial resources
const resources = {
  en: {
    translation: enTranslation
  },
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
    // Here we'd normally fetch these from a server
    // For simplicity, we'll just implement English completely
    // and then simulate loading other languages
    console.log(`Loading language: ${language}`);
    
    // In a real app, this would be:
    // const module = await import(`./translations/${language}.ts`);
    // i18n.addResourceBundle(language, 'translation', module.default);
    
    // For now, we'll just report that we loaded it
    i18n.addResourceBundle(language, 'translation', {
      ...enTranslation,
      language_name: supportedLanguages[language].nativeName
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error(`Error loading language ${language}:`, error);
    return Promise.reject(error);
  }
};

export default i18n;
