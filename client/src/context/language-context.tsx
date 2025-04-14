import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n/languages';
import { loadLanguageAsync } from '../i18n/config';

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  languages: typeof supportedLanguages;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Languages that use RTL (right-to-left) direction
const rtlLanguages = ['ar'];

// Helper function to check if a language is RTL
const isRtlLanguage = (language: string): boolean => {
  return rtlLanguages.includes(language);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isRtl, setIsRtl] = useState(isRtlLanguage(i18n.language || 'en'));

  // Function to apply RTL/LTR direction to document
  const applyDirection = (language: string) => {
    const rtl = isRtlLanguage(language);
    setIsRtl(rtl);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    
    // Add/remove RTL class to body for additional styling hooks
    if (rtl) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  };

  useEffect(() => {
    // Get saved language from localStorage or use browser default
    const savedLanguage = localStorage.getItem('i18nextLng') || navigator.language.split('-')[0];
    
    // If saved language is valid, use it
    if (Object.keys(supportedLanguages).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      loadLanguageAsync(savedLanguage);
      i18n.changeLanguage(savedLanguage);
      
      // Set RTL direction
      applyDirection(savedLanguage);
    } else {
      // Otherwise default to English
      loadLanguageAsync('en');
      applyDirection('en');
    }
  }, []);

  const changeLanguage = async (language: string) => {
    try {
      console.log(`Changing language to: ${language}`);
      // Only load if it's a different language
      if (language !== currentLanguage) {
        await loadLanguageAsync(language);
        await i18n.changeLanguage(language);
        
        // Store in localStorage for persistence
        localStorage.setItem('i18nextLng', language);
        
        // Update state
        setCurrentLanguage(language);
        
        // Update document direction for RTL languages like Arabic
        applyDirection(language);
        
        // Force reload the page to ensure all components update properly
        // This is a more reliable way to ensure RTL is applied correctly
        window.location.reload();
        
        console.log(`Language changed successfully to: ${language}`);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages: supportedLanguages, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
