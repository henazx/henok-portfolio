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
  PENDING_KEY,
  UNLOCK_EVENT,
  deepMerge,
  getByPath,
  isPlainObject,
  normalizePublishContent,
  setByPath,
} from "@/lib/editor";
import {
  getPublishSession,
  loginToPublish,
  logoutPublish,
  publishSite,
} from "@/lib/publish-client";
import type { SiteContent } from "@/types";

interface DraftConflict {
  content: SiteContent;
  version: string | null;
}

interface EditorContextValue {
  content: SiteContent;
  unlocked: boolean;
  editorOpen: boolean;
  dirty: boolean;
  publishing: boolean;
  status: string | null;
  publishError: string | null;
  draftConflict: DraftConflict | null;
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
  moveItem: (path: string, from: number, to: number) => void;
  resetChanges: () => void;
  keepDraft: () => void;
  discardDraft: () => void;
  publish: () => Promise<void>;
  dismissPublishError: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const baseContent = initialContent as SiteContent;

const PENDING_MAX_AGE_MS = 15 * 60 * 1000;

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

interface PendingPublish {
  contentHash: string;
  content: SiteContent;
  publishedAt: number;
}

function normalizeStoredContent(value: unknown): SiteContent | null {
  if (!isPlainObject(value)) return null;
  return normalizePublishContent(value) as SiteContent;
}

function parseDraft(raw: string): DraftConflict | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return null;

    const content = normalizeStoredContent(parsed.content);
    if (!content) return null;

    return {
      content,
      version: typeof parsed.version === "string" ? parsed.version : null,
    };
  } catch {
    return null;
  }
}

function parsePending(raw: string): PendingPublish | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return null;

    const content = normalizeStoredContent(parsed.content);
    if (
      typeof parsed.contentHash !== "string" ||
      !parsed.contentHash ||
      typeof parsed.publishedAt !== "number" ||
      !Number.isFinite(parsed.publishedAt) ||
      !content
    ) {
      return null;
    }

    return {
      contentHash: parsed.contentHash,
      content,
      publishedAt: parsed.publishedAt,
    };
  } catch {
    return null;
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(baseContent);
  const [publishedContent, setPublishedContent] =
    useState<SiteContent>(baseContent);
  const [unlocked, setUnlocked] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [draftConflict, setDraftConflict] = useState<DraftConflict | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Restore content after hydration so server and client render the same
    // HTML first. A pending publish bridges the gap until Vercel rebuilds.
    let nextPublished = baseContent;
    let nextContent = baseContent;
    let nextDirty = false;
    let nextStatus: string | null = null;
    let nextConflict: DraftConflict | null = null;
    let effectiveVersion = CONTENT_VERSION;

    try {
      const pendingRaw = window.localStorage.getItem(PENDING_KEY);
      if (pendingRaw) {
        const pending = parsePending(pendingRaw);
        if (!pending) {
          window.localStorage.removeItem(PENDING_KEY);
        } else if (pending.contentHash === CONTENT_VERSION) {
          window.localStorage.removeItem(PENDING_KEY);
        } else if (Date.now() - pending.publishedAt < PENDING_MAX_AGE_MS) {
          nextPublished = pending.content;
          nextContent = pending.content;
          nextStatus =
            "Your changes are published and the site is still rebuilding.";
          effectiveVersion = pending.contentHash;
        } else {
          window.localStorage.removeItem(PENDING_KEY);
          nextStatus = "The last publish may not have deployed. Check Vercel.";
        }
      }

      const draftRaw = window.localStorage.getItem(DRAFT_KEY);
      if (draftRaw) {
        const draft = parseDraft(draftRaw);
        if (!draft) {
          window.localStorage.removeItem(DRAFT_KEY);
        } else if (draft.version === effectiveVersion) {
          nextContent = deepMerge(nextPublished, draft.content);
          nextDirty = true;
        } else {
          // Never delete an unpublished draft just because the published
          // version changed. Ask the editor which version to keep.
          nextConflict = draft;
        }
      }
    } catch {
      // Storage may be unavailable; the published content still renders.
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPublishedContent(nextPublished);
    setContent(nextContent);
    setDirty(nextDirty);
    setStatus(nextStatus);
    setDraftConflict(nextConflict);

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

  const saveDraft = useCallback(
    (next: SiteContent) => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            version: contentVersion(publishedContent),
            content: next,
          } satisfies DraftEnvelope),
        );
      } catch {
        setStatus("Browser storage is full — changes are only in this session.");
      }
    },
    [publishedContent],
  );

  const setField = useCallback(
    (path: string, value: unknown) => {
      if (draftConflict) return;
      setContent((current) => {
        const next = setByPath(current, path, value);
        saveDraft(next);
        return next;
      });
      setDirty(true);
      setStatus(null);
      setPublishError(null);
    },
    [draftConflict, saveDraft],
  );

  const addItem = useCallback(
    (path: string, template: unknown) => {
      if (draftConflict) return;
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
    [draftConflict, saveDraft],
  );

  const removeItem = useCallback(
    (path: string, index: number) => {
      if (draftConflict) return;
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
    [draftConflict, saveDraft],
  );

  const moveItem = useCallback(
    (path: string, from: number, to: number) => {
      if (draftConflict) return;
      setContent((current) => {
        const existing = getByPath(current, path);
        if (
          !Array.isArray(existing) ||
          from === to ||
          from < 0 ||
          to < 0 ||
          from >= existing.length ||
          to >= existing.length
        ) {
          return current;
        }

        const nextList = [...existing];
        const [moved] = nextList.splice(from, 1);
        nextList.splice(to, 0, moved);
        const next = setByPath(current, path, nextList);
        saveDraft(next);
        return next;
      });
      setDirty(true);
      setStatus(null);
      setPublishError(null);
    },
    [draftConflict, saveDraft],
  );

  const resetChanges = useCallback(() => {
    if (draftConflict) return;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // The in-memory reset still works when storage is unavailable.
    }
    setContent(publishedContent);
    setDirty(false);
    setPublishError(null);
    setStatus("Changes discarded. Showing the published content.");
  }, [draftConflict, publishedContent]);

  const keepDraft = useCallback(() => {
    if (!draftConflict) return;

    const next = deepMerge(publishedContent, draftConflict.content);
    setContent(next);
    setDirty(true);
    setDraftConflict(null);
    setStatus(null);

    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: contentVersion(publishedContent),
          content: next,
        } satisfies DraftEnvelope),
      );
    } catch {
      setStatus("Browser storage is full — changes are only in this session.");
    }
  }, [draftConflict, publishedContent]);

  const discardDraft = useCallback(() => {
    if (!draftConflict) return;

    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // The in-memory discard still works when storage is unavailable.
    }
    setDraftConflict(null);
    setContent(publishedContent);
    setDirty(false);
    setStatus("Draft discarded. Showing the published content.");
  }, [draftConflict, publishedContent]);

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
    if (draftConflict) return;

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

    const published = result.content ?? content;
    const record: PendingPublish = {
      contentHash: contentVersion(published),
      content: published,
      publishedAt: Date.now(),
    };

    let storageMessage: string | null = null;
    try {
      // Write the pending record first. If it cannot be saved, leave the draft
      // untouched so the user's work is never discarded.
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(record));
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // Keep a stale copy consistent with the pending content so it is not
        // mistaken for an older draft when the page reloads.
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            version: record.contentHash,
            content: published,
          } satisfies DraftEnvelope),
        );
      }
    } catch {
      storageMessage = "Published, but this browser could not save the rebuild status.";
    }

    if (result.content) setContent(result.content);
    setPublishedContent(published);
    setDirty(false);
    setStatus(
      storageMessage ??
        (result.changed === false
          ? "Everything is already up to date. No new commit was needed."
          : "Published. Vercel will rebuild with your changes shortly."),
    );
    setPublishing(false);
  }, [content, draftConflict]);

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
      draftConflict,
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
      moveItem,
      resetChanges,
      keepDraft,
      discardDraft,
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
      draftConflict,
      authPromptOpen,
      authenticating,
      authError,
      exitEditor,
      authenticate,
      cancelAuth,
      setField,
      addItem,
      removeItem,
      moveItem,
      resetChanges,
      keepDraft,
      discardDraft,
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
