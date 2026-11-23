"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  CONTACT_LIMITS,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact";
import styles from "./ContactForm.module.css";

type Status = "idle" | "submitting" | "success" | "error";

interface FormValues {
  name: string;
  email: string;
  message: string;
  company: string;
}

const initialValues: FormValues = {
  name: "",
  email: "",
  message: "",
  company: "",
};

export function ContactForm() {
  const { t } = useLanguage();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(field: ContactField | "company") {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [field]: value }));

      if (field !== "company" && errors[field]) {
        setErrors((previous) => {
          const next = { ...previous };
          delete next[field];
          return next;
        });
      }

      if (status === "success" || status === "error") {
        setStatus("idle");
        setFeedback("");
      }
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { data, errors: nextErrors } = validateContact(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("idle");
      const firstInvalid = Object.keys(nextErrors)[0] as ContactField;
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        errors?: ContactErrors;
      } | null;

      if (!response.ok || !payload?.ok) {
        if (payload?.errors) {
          setErrors(payload.errors);
        }
        setStatus("error");
        setFeedback(
          t(
            payload?.message ??
              "The message could not be sent. Please email me directly instead.",
          ),
        );
        return;
      }

      setStatus("success");
      setFeedback(t("Thanks — your message has been sent."));
      setValues(initialValues);
      setErrors({});
    } catch {
      setStatus("error");
      setFeedback(
        t(
          "The message could not be sent. Check your connection, or use the direct email address on the left.",
        ),
      );
    }
  }

  return (
    <form
      className={styles.form}
      data-glow
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "submitting"}
    >
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>{t("Send a message")}</h3>
        <p className={styles.formSubtitle}>
          {t("Fields marked with an asterisk are required.")}
        </p>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-name">
            {t("Name")} <span className={styles.required}>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={values.name}
            onChange={handleChange("name")}
            placeholder={t("Your name")}
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name ? (
            <p className={styles.errorText} id="contact-name-error">
              {t(errors.name)}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">
            {t("Email")} <span className={styles.required}>*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={values.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email ? (
            <p className={styles.errorText} id="contact-email-error">
              {t(errors.email)}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor="contact-message">
            {t("Message")} <span className={styles.required}>*</span>
          </label>
          <span className={styles.counter}>
            {values.message.length}/{CONTACT_LIMITS.message}
          </span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
          value={values.message}
          onChange={handleChange("message")}
          placeholder={t("A little about the role, project, or question…")}
          maxLength={CONTACT_LIMITS.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p className={styles.errorText} id="contact-message-error">
            {t(errors.message)}
          </p>
        ) : null}
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-company">{t("Company")}</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={handleChange("company")}
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${styles.submit}`}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className={styles.spinner} aria-hidden="true" />
            {t("Sending…")}
          </>
        ) : (
          <>
            <Send aria-hidden="true" />
            {t("Send message")}
          </>
        )}
      </button>

      <p className={styles.privacy}>
        {t(
          "Your details are only used to reply to this message. No newsletter, no sharing.",
        )}
      </p>

      <div role="status" aria-live="polite">
        {status === "success" ? (
          <p className={`${styles.status} ${styles.statusSuccess}`}>
            <CheckCircle2 aria-hidden="true" />
            <span>{feedback}</span>
          </p>
        ) : null}
        {status === "error" ? (
          <p className={`${styles.status} ${styles.statusError}`}>
            <AlertCircle aria-hidden="true" />
            <span>{feedback}</span>
          </p>
        ) : null}
      </div>
    </form>
  );
}
