import sanitizeHtml from "sanitize-html";

const ASSERTIVE_PATTERNS = [
  /ブラック企業/gi,
  /違法確定/gi,
  /詐欺/gi,
  /絶対に/gi,
];

export const containsBlockedPersonalInfo = (value: string) => {
  const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
  const phonePattern = /(?:\+81[- ]?)?(?:0\d{1,4}[- ]?\d{1,4}[- ]?\d{4})/;
  return emailPattern.test(value) || phonePattern.test(value);
};

export const containsAssertiveLanguage = (value: string) =>
  ASSERTIVE_PATTERNS.some((pattern) => pattern.test(value));

export const sanitizePlainText = (value: string) =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
