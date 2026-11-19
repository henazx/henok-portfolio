"use client";

import { useEffect } from "react";

import {
  EDIT_KEYWORD,
  UNLOCK_EVENT,
  UNLOCK_KEY,
} from "@/lib/editor";

/** Type the keyword anywhere outside a form field to reveal the editor. */
export function EditUnlock() {
  useEffect(() => {
    let buffer = "";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;

      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isTyping) {
        buffer = "";
        return;
      }

      buffer = (buffer + event.key).slice(-EDIT_KEYWORD.length);
      if (buffer !== EDIT_KEYWORD) return;

      buffer = "";
      window.sessionStorage.setItem(UNLOCK_KEY, "1");
      window.dispatchEvent(new Event(UNLOCK_EVENT));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
