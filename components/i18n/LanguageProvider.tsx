"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  isLanguage,
  translate,
  type Language,
} from "@/lib/i18n/dictionary";

const STORAGE_KEY = "henok-portfolio-language";
const QUERY_KEY = "lang";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function readUrlLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(QUERY_KEY);
  return isLanguage(value) ? value : null;
}

function readLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const fromUrl = readUrlLanguage();
  if (fromUrl) return fromUrl;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : "en";
  } catch {
    return "en";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener("popstate", listener);
  };
}

function updateUrl(next: Language) {
  const url = new URL(window.location.href);
  if (next === "en") {
    url.searchParams.delete(QUERY_KEY);
  } else {
    url.searchParams.set(QUERY_KEY, next);
  }
  // replaceState keeps the switch instant and avoids a new history entry for
  // every language change. Other query parameters and the hash are preserved.
  window.history.replaceState(window.history.state, "", url);
}

function setStoredLanguage(next: Language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable; the switch still works for this visit.
  }
  updateUrl(next);
  notify();
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  // Server HTML uses the initial language. The visitor's saved/URL preference
  // is restored after hydration by useSyncExternalStore, which keeps the first
  // client render identical to the server render.
  const language = useSyncExternalStore<Language>(
    subscribe,
    readLanguage,
    () => initialLanguage,
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    document.documentElement.setAttribute("data-language", language);

    // An explicit ?lang= link should stick for later visits too.
    if (readUrlLanguage()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, language);
      } catch {
        // Storage can be unavailable; the URL still carries the choice.
      }
    }
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
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
