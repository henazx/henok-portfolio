"use client";

import { useEffect } from "react";

import { EDIT_KEYWORD, UNLOCK_EVENT } from "@/lib/editor";

/**
 * Typing the keyword outside a form field opens the password gate. The keyword
 * itself grants no access — only the server-issued session does.
 */
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
      window.dispatchEvent(new Event(UNLOCK_EVENT));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
