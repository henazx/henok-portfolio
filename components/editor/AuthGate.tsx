"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { KeyRound, Loader2, LockKeyhole, X } from "lucide-react";

import { useEditor } from "./ContentProvider";
import styles from "./AuthGate.module.css";

/**
 * The keyword only reveals this gate. Access is granted by the server after it
 * verifies PUBLISH_PASSWORD and issues an HttpOnly session cookie.
 */
export function AuthGate() {
  const {
    authPromptOpen,
    authenticating,
    authError,
    authenticate,
    cancelAuth,
  } = useEditor();
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authPromptOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelAuth();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled])",
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [authPromptOpen, cancelAuth]);

  if (!authPromptOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const unlocked = await authenticate(password);
    if (unlocked) setPassword("");
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancelAuth();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
        data-glow
      >
        <div className={styles.header}>
          <span className={styles.badge} aria-hidden="true">
            <LockKeyhole />
          </span>
          <button
            type="button"
            className={styles.close}
            onClick={cancelAuth}
            aria-label="Cancel unlock"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <p className={styles.eyebrow}>Private editor</p>
        <h2 id="auth-title">Enter the publishing password</h2>
        <p id="auth-description" className={styles.description}>
          The keyword only opened this prompt. The password is checked on the
          server and never stored in your browser.
        </p>

        <form onSubmit={handleSubmit}>
          <label className={styles.field} htmlFor="editor-password">
            Password
          </label>
          <input
            ref={inputRef}
            id="editor-password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={authenticating}
            maxLength={256}
            required
            aria-invalid={authError ? true : undefined}
            aria-describedby={authError ? "editor-auth-error" : undefined}
          />

          {authError ? (
            <p className={styles.error} id="editor-auth-error" role="alert">
              {authError}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={cancelAuth}
              disabled={authenticating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={authenticating || password.length === 0}
            >
              {authenticating ? (
                <>
                  <Loader2 className={styles.spinner} aria-hidden="true" />
                  Checking…
                </>
              ) : (
                <>
                  <KeyRound aria-hidden="true" />
                  Unlock editor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
