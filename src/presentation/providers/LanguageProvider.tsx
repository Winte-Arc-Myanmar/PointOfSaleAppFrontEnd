"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  translations,
  type Language,
  type TranslationKey,
} from "@/presentation/i18n/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

function resolveTranslation(lang: Language, key: TranslationKey): string | null {
  const [group, name] = key.split(".") as [keyof typeof translations.en, string];
  const bucket = translations[lang]?.[group] as Record<string, string> | undefined;
  if (!bucket) return null;
  return bucket[name] ?? null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return saved === "my" ? "my" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage failures.
    }
    document.documentElement.lang = language === "my" ? "my" : "en";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback?: string) =>
      resolveTranslation(language, key) ??
      resolveTranslation("en", key) ??
      fallback ??
      key,
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
