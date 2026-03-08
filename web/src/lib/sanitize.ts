import sanitizeHtml from "sanitize-html";

export function sanitizePlainText(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\r\n/g, "\n")
    .trim();
}

export function sanitizeOptionalText(input: string | null | undefined) {
  if (!input) {
    return null;
  }

  const value = sanitizePlainText(input);
  return value || null;
}
