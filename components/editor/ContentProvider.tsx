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

import initialContent from "@/data/content.json";
import {
  DRAFT_KEY,
  EDIT_KEYWORD,
  UNLOCK_EVENT,
  UNLOCK_KEY,
  deepMerge,
  getByPath,
  setByPath,
} from "@/lib/editor";
import type { SiteContent } from "@/types";

interface EditorContextValue {
  content: SiteContent;
  unlocked: boolean;
  editorOpen: boolean;
  dirty: boolean;
  publishing: boolean;
  status: string | null;
  openEditor: () => void;
  closeEditor: () => void;
  exitEditor: () => void;
  setField: (path: string, value: unknown) => void;
  addItem: (path: string, template: unknown) => void;
  removeItem: (path: string, index: number) => void;
  resetChanges: () => void;
  publish: () => Promise<void>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const baseContent = initialContent as SiteContent;

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(baseContent);
  const [unlocked, setUnlocked] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    // Restoring a private draft must happen after hydration so the server and
    // client render identical HTML first.
    try {
      const draft = window.localStorage.getItem(DRAFT_KEY);
      if (draft) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setContent(deepMerge(baseContent, JSON.parse(draft)));
        setDirty(true);
      }
    } catch {
      // A malformed draft should never break the site.
    }

    const wasUnlocked = window.sessionStorage.getItem(UNLOCK_KEY) === "1";
    if (wasUnlocked) setUnlocked(true);

    const onUnlock = () => {
      setUnlocked(true);
      setEditorOpen(true);
    };
    window.addEventListener(UNLOCK_EVENT, onUnlock);
    return () => window.removeEventListener(UNLOCK_EVENT, onUnlock);
  }, []);

  const saveDraft = useCallback((next: SiteContent) => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {
      setStatus("Browser storage is full — changes are only in this session.");
    }
  }, []);

  const setField = useCallback(
    (path: string, value: unknown) => {
      setContent((current) => {
        const next = setByPath(current, path, value);
        saveDraft(next);
        return next;
      });
      setDirty(true);
      setStatus(null);
    },
    [saveDraft],
  );

  const addItem = useCallback(
    (path: string, template: unknown) => {
      setContent((current) => {
        const existing = getByPath(current, path);
        const list = Array.isArray(existing) ? existing : [];
        const next = setByPath(current, path, [...list, template]);
        saveDraft(next);
        return next;
      });
      setDirty(true);
      setStatus(null);
    },
    [saveDraft],
  );

  const removeItem = useCallback(
    (path: string, index: number) => {
      setContent((current) => {
        const existing = getByPath(current, path);
        const list = Array.isArray(existing) ? existing : [];
        const nextList = list.filter((_, position) => position !== index);
        const next = setByPath(current, path, nextList);
        saveDraft(next);
        return next;
      });
      setDirty(true);
      setStatus(null);
    },
    [saveDraft],
  );

  const resetChanges = useCallback(() => {
    window.localStorage.removeItem(DRAFT_KEY);
    setContent(baseContent);
    setDirty(false);
    setStatus("Changes discarded. Showing the published content.");
  }, []);

  const exitEditor = useCallback(() => {
    setUnlocked(false);
    setEditorOpen(false);
    window.sessionStorage.removeItem(UNLOCK_KEY);
    setStatus(null);
  }, []);

  const publish = useCallback(async () => {
    setPublishing(true);
    setStatus(null);
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: EDIT_KEYWORD, content }),
      });
      const result = (await response.json()) as {
        content?: SiteContent;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(result.message ?? "Publishing failed.");
      }
      if (result.content) setContent(result.content);
      window.localStorage.removeItem(DRAFT_KEY);
      setDirty(false);
      setStatus("Published. Vercel will rebuild with your changes shortly.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Publishing failed.",
      );
    } finally {
      setPublishing(false);
    }
  }, [content]);

  const value = useMemo<EditorContextValue>(
    () => ({
      content,
      unlocked,
      editorOpen,
      dirty,
      publishing,
      status,
      openEditor: () => setEditorOpen(true),
      closeEditor: () => setEditorOpen(false),
      exitEditor,
      setField,
      addItem,
      removeItem,
      resetChanges,
      publish,
    }),
    [
      content,
      unlocked,
      editorOpen,
      dirty,
      publishing,
      status,
      exitEditor,
      setField,
      addItem,
      removeItem,
      resetChanges,
      publish,
    ],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used inside ContentProvider");
  }
  return context;
}
