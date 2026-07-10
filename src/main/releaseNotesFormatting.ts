const hasHtmlMarkup = (value: string): boolean => /<\/?[a-z][\w-]*\b[^>]*>/i.test(value);

const decodeHtmlEntities = (value: string): string => value
  .replaceAll(/&nbsp;/gi, ' ')
  .replaceAll(/&amp;/gi, '&')
  .replaceAll(/&lt;/gi, '<')
  .replaceAll(/&gt;/gi, '>')
  .replaceAll(/&quot;/gi, '"')
  .replaceAll(/&#39;|&apos;/gi, "'");

// Electron dialogs render plain text only, so sanitize common HTML notes.
const normalizeReleaseNotesText = (value: string): string => {
  const text = value.trim();

  if (!hasHtmlMarkup(text)) {
    return text;
  }

  return decodeHtmlEntities(
    text
      .replaceAll(/<br\s*\/?>/gi, '\n')
      .replaceAll(/<\/p>/gi, '\n\n')
      .replaceAll(/<\/li>/gi, '\n')
      .replaceAll(/<li\b[^>]*>/gi, '- ')
      .replaceAll(/<[^>]+>/g, ''),
  )
    .replaceAll(/\r\n?/g, '\n')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim();
};

export {
  normalizeReleaseNotesText,
};
