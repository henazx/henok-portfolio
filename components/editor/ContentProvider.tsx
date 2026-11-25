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
  publishError: string | null;
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
  dismissPublishError: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const baseContent = initialContent as SiteContent;

/** Stable build-time fingerprint of the published content. */
function contentVersion(content: unknown): string {
  const source = JSON.stringify(content);
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

const CONTENT_VERSION = contentVersion(baseContent);

interface DraftEnvelope {
  version: string;
  content: SiteContent;
}

function parseDraft(raw: string): { content: SiteContent | null; stale: boolean } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      "content" in parsed
    ) {
      const envelope = parsed as DraftEnvelope;
      return envelope.version === CONTENT_VERSION
        ? { content: envelope.content, stale: false }
        : { content: null, stale: true };
    }
    // A raw, unversioned draft belongs to an older build and must not override
    // newer published copy.
    return { content: null, stale: true };
  } catch {
    return { content: null, stale: true };
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(baseContent);
  const [unlocked, setUnlocked] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Restore a private draft after hydration so server and client render the
    // same HTML first. Drafts are content, never credentials.
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = parseDraft(raw);
        if (draft.content) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setContent(deepMerge(baseContent, draft.content));
          setDirty(true);
        } else {
          window.localStorage.removeItem(DRAFT_KEY);
          setStatus("An older saved draft was cleared. Showing the published content.");
        }
      }
    } catch {
      // A malformed draft should never break the site.
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // Storage may be unavailable; the published content still renders.
      }
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
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ version: CONTENT_VERSION, content: next } satisfies DraftEnvelope),
      );
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
      setPublishError(null);
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
      setPublishError(null);
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
      setPublishError(null);
    },
    [saveDraft],
  );

  const resetChanges = useCallback(() => {
    window.localStorage.removeItem(DRAFT_KEY);
    setContent(baseContent);
    setDirty(false);
    setPublishError(null);
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
    setPublishError(null);
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
    setPublishError(null);
  }, []);

  const publish = useCallback(async () => {
    setPublishing(true);
    setStatus(null);
    setPublishError(null);
    const result = await publishSite(content);

    if (result.status === 401) {
      setUnlocked(false);
      setEditorOpen(false);
      setAuthPromptOpen(true);
      setAuthError("Your session expired. Enter the password again.");
      setPublishError("Your session expired. Unlock again to publish.");
      setPublishing(false);
      return;
    }
    if (!result.ok) {
      setPublishError(result.message ?? "Publishing failed.");
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

  const dismissPublishError = useCallback(() => setPublishError(null), []);

  const value = useMemo<EditorContextValue>(
    () => ({
      content,
      unlocked,
      editorOpen,
      dirty,
      publishing,
      status,
      publishError,
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
      dismissPublishError,
    }),
    [
      content,
      unlocked,
      editorOpen,
      dirty,
      publishing,
      status,
      publishError,
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
      dismissPublishError,
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
