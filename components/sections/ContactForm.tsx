"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  Send,
} from "lucide-react";

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

interface ContactFormProps {
  configured: boolean;
  email: string;
}

export function ContactForm({ configured, email }: ContactFormProps) {
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

    // Without a configured email provider, hand the message to the user's
    // email client instead of pretending the form was delivered.
    if (!configured) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      );

      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      setStatus("success");
      setFeedback(
        "Your email app should open with the message prepared. If nothing happens, email me directly using the address on the left.",
      );
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
          payload?.message ??
            "The message could not be sent. Please email me directly instead.",
        );
        return;
      }

      setStatus("success");
      setFeedback("Thanks — your message has been sent.");
      setValues(initialValues);
      setErrors({});
    } catch {
      setStatus("error");
      setFeedback(
        "The message could not be sent. Check your connection, or use the direct email address on the left.",
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
        <h3 className={styles.formTitle}>Send a message</h3>
        <p className={styles.formSubtitle}>
          Fields marked with an asterisk are required.
        </p>
      </div>

      {!configured ? (
        <div className={styles.notice}>
          <Info aria-hidden="true" />
          <p>
            Email delivery isn&apos;t connected on this deployment yet, so
            submitting opens a pre-filled message in your email app. You can
            also{" "}
            <a href={`mailto:${email}`} className={styles.noticeLink}>
              email me directly
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-name">
            Name <span className={styles.required}>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={values.name}
            onChange={handleChange("name")}
            placeholder="Your name"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name ? (
            <p className={styles.errorText} id="contact-name-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">
            Email <span className={styles.required}>*</span>
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
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor="contact-message">
            Message <span className={styles.required}>*</span>
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
          placeholder="A little about the role, project, or question…"
          maxLength={CONTACT_LIMITS.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p className={styles.errorText} id="contact-message-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
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
            Sending…
          </>
        ) : configured ? (
          <>
            <Send aria-hidden="true" />
            Send message
          </>
        ) : (
          <>
            <Mail aria-hidden="true" />
            Compose email
          </>
        )}
      </button>

      <p className={styles.privacy}>
        Your details are only used to reply to this message. No newsletter, no
        sharing.
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
