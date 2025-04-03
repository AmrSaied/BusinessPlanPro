import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Language, getTranslation } from "../../server/i18n/translations";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string }[];
};

const availableLanguages = [
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

export const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  // Detect browser language on initial load
  useEffect(() => {
    // If user has a language preference, use that
    if (user?.language) {
      setLanguageState(user.language as Language);
    } else {
      // Otherwise detect from browser
      const browserLang = navigator.language.split('-')[0] as Language;
      if (availableLanguages.some(lang => lang.code === browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, [user]);

  // Mutation to update user language preference
  const updateLanguageMutation = useMutation({
    mutationFn: async (lang: Language) => {
      if (!user) return;
      await apiRequest("POST", "/api/user/language", { language: lang });
    },
  });

  // Set language with persistence for logged in users
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // If user is logged in, save preference
    if (user) {
      updateLanguageMutation.mutate(lang);
    }
  };

  // Translation function
  const t = (key: string) => getTranslation(key, language);

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        availableLanguages
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
