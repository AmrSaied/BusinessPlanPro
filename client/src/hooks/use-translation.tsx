import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Language, getTranslation, availableLanguages, detectBrowserLanguage } from "@/i18n";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string }[];
};

// Using availableLanguages imported from @/i18n

export const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  // Detect browser language on initial load
  useEffect(() => {
    // If user has a language preference, use that
    if (user?.preferredLanguage) {
      setLanguageState(user.preferredLanguage as Language);
    } else {
      // Otherwise detect from browser
      setLanguageState(detectBrowserLanguage());
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
