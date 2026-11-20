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
  UNLOCK_EVENT,
  deepMerge,
  getByPath,
  setByPath,
} from "@/lib/editor";
import {
  getPublishSession,
  loginToPublish,
  logoutPublish,
  publishSite,
} from "@/lib/publish-client";
import type { SiteContent } from "@/types";

interface EditorContextValue {
  content: SiteContent;
  unlocked: boolean;
  editorOpen: boolean;
  dirty: boolean;
  publishing: boolean;
  status: string | null;
  authPromptOpen: boolean;
  authenticating: boolean;
  authError: string | null;
  openEditor: () => void;
  closeEditor: () => void;
  exitEditor: () => void;
  authenticate: (password: string) => Promise<boolean>;
  cancelAuth: () => void;
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
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Restore a private draft after hydration so server and client render the
    // same HTML first. Drafts are content, never credentials.
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

    // Restore access only from the HttpOnly session cookie, verified by the
    // server. There is deliberately no sessionStorage unlock flag anymore.
    void (async () => {
      if (await getPublishSession()) {
        setUnlocked(true);
      }
    })();
  }, []);

  useEffect(() => {
    const onUnlock = () => {
      if (unlocked) {
        setEditorOpen(true);
      } else {
        setAuthError(null);
        setAuthPromptOpen(true);
      }
    };
    window.addEventListener(UNLOCK_EVENT, onUnlock);
    return () => window.removeEventListener(UNLOCK_EVENT, onUnlock);
  }, [unlocked]);

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

  const authenticate = useCallback(async (password: string) => {
    setAuthenticating(true);
    setAuthError(null);
    const result = await loginToPublish(password);
    if (!result.ok) {
      setAuthError(result.message ?? "Could not unlock the editor.");
      setAuthenticating(false);
      return false;
    }
    setUnlocked(true);
    setAuthPromptOpen(false);
    setEditorOpen(true);
    setStatus(null);
    setAuthenticating(false);
    return true;
  }, []);

  const cancelAuth = useCallback(() => {
    setAuthPromptOpen(false);
    setAuthError(null);
  }, []);

  const exitEditor = useCallback(() => {
    void logoutPublish();
    setUnlocked(false);
    setEditorOpen(false);
    setAuthPromptOpen(false);
    setAuthError(null);
    setStatus(null);
  }, []);

  const publish = useCallback(async () => {
    setPublishing(true);
    setStatus(null);
    const result = await publishSite(content);

    if (result.status === 401) {
      setUnlocked(false);
      setEditorOpen(false);
      setAuthPromptOpen(true);
      setAuthError("Your session expired. Enter the password again.");
      setStatus("Session expired — publishing was not attempted.");
      setPublishing(false);
      return;
    }
    if (!result.ok) {
      setStatus(result.message ?? "Publishing failed.");
      setPublishing(false);
      return;
    }

    if (result.content) setContent(result.content);
    window.localStorage.removeItem(DRAFT_KEY);
    setDirty(false);
    setStatus(
      result.changed === false
        ? "Everything is already up to date. No new commit was needed."
        : "Published. Vercel will rebuild with your changes shortly.",
    );
    setPublishing(false);
  }, [content]);

  const value = useMemo<EditorContextValue>(
    () => ({
      content,
      unlocked,
      editorOpen,
      dirty,
      publishing,
      status,
      authPromptOpen,
      authenticating,
      authError,
      openEditor: () => setEditorOpen(true),
      closeEditor: () => setEditorOpen(false),
      exitEditor,
      authenticate,
      cancelAuth,
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
      authPromptOpen,
      authenticating,
      authError,
      exitEditor,
      authenticate,
      cancelAuth,
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
