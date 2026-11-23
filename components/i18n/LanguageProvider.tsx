"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  createContext,
  type ReactNode,
} from "react";

import { translate, type Language } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "henok-portfolio-language";

const listeners = new Set<() => void>();

function readLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "am" || stored === "en" ? stored : "en";
  } catch {
    return "en";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function setStoredLanguage(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable; the switch still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Server HTML is English. The preference is restored after hydration by
  // useSyncExternalStore, so the first client render matches the server.
  const language = useSyncExternalStore<Language>(
    subscribe,
    readLanguage,
    () => "en",
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute("data-language", language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setStoredLanguage(next);
  }, []);

  const t = useCallback(
    (text: string) => translate(text, language),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
