export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export type ContactField = "name" | "email" | "message";
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Shared by the client form and the API route so both enforce the same rules.
 */
export function validateContact(input: unknown): {
  data: ContactPayload;
  errors: ContactErrors;
} {
  const source =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const data: ContactPayload = {
    name: asTrimmedString(source.name),
    email: asTrimmedString(source.email),
    message: asTrimmedString(source.message),
    company: asTrimmedString(source.company),
  };

  const errors: ContactErrors = {};

  if (!data.name) {
    errors.name = "Please enter your name.";
  } else if (data.name.length < 2) {
    errors.name = "Your name must be at least 2 characters.";
  } else if (data.name.length > CONTACT_LIMITS.name) {
    errors.name = `Your name must be ${CONTACT_LIMITS.name} characters or fewer.`;
  }

  if (!data.email) {
    errors.email = "Please enter your email address.";
  } else if (data.email.length > CONTACT_LIMITS.email) {
    errors.email = "That email address is too long.";
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.message) {
    errors.message = "Please enter a message.";
  } else if (data.message.length < 10) {
    errors.message = "Your message must be at least 10 characters.";
  } else if (data.message.length > CONTACT_LIMITS.message) {
    errors.message = `Your message must be ${CONTACT_LIMITS.message} characters or fewer.`;
  }

  return { data, errors };
}
