"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import styles from "./ThemeToggle.module.css";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
const modes: ThemeMode[] = ["system", "light", "dark"];

const actionLabels: Record<ThemeMode, string> = {
  system: "Switch to system theme",
  light: "Switch to light theme",
  dark: "Switch to dark theme",
};

const modeLabels: Record<ThemeMode, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function readMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function resolveTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : mode;

  root.dataset.themeMode = mode;
  root.setAttribute("data-theme", resolved);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: light)");
  const onSystemChange = () => {
    resolveTheme(readMode());
    notify();
  };

  const onStorageChange = () => {
    resolveTheme(readMode());
    listener();
  };

  window.addEventListener("storage", onStorageChange);
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorageChange);
    media.removeEventListener("change", onSystemChange);
  };
}

function setMode(mode: ThemeMode) {
  resolveTheme(mode);
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage can be unavailable in private browsing; the toggle still works
    // for the current page view.
  }
  notify();
}

export function ThemeToggle() {
  const { t } = useLanguage();
  // Server HTML and hydration both start at "system"; the stored preference is
  // restored by useSyncExternalStore without a state update in an effect.
  const mode = useSyncExternalStore<ThemeMode>(
    subscribe,
    readMode,
    () => "system",
  );

  const next = modes[(modes.indexOf(mode) + 1) % modes.length];
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setMode(next)}
      aria-label={t(actionLabels[next])}
      title={`${t("Theme")}: ${t(modeLabels[mode])}`}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}
