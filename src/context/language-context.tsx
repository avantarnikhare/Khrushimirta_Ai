"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
  type LanguageCode,
  detectPreferredLanguage,
  isLanguageCode,
  type TranslationDictionary,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (nextLanguage: LanguageCode) => void;
  dictionary: TranslationDictionary;
  options: Array<{ code: LanguageCode; label: string }>;
  isHydrated: boolean;
};

const STORAGE_KEY = "krushi_global_language_v1";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);

    if (isLanguageCode(storedLanguage)) {
      setLanguageState(storedLanguage);
      setIsHydrated(true);
      return;
    }

    const detectedLanguage = detectPreferredLanguage([
      ...(window.navigator.languages ?? []),
      window.navigator.language,
    ]);

    setLanguageState(detectedLanguage);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language, isHydrated]);

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      setLanguage,
      dictionary: TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE],
      options: LANGUAGE_OPTIONS,
      isHydrated,
    };
  }, [language, setLanguage, isHydrated]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
