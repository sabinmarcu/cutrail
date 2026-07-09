// @ts-check

/**
 * @param {string} value
 * @returns {boolean}
 */
const hasHtmlMarkup = (value) => /<\/?[a-z][\w-]*\b[^>]*>/i.test(value);

/**
 * @param {string} value
 * @returns {string}
 */
const decodeHtmlEntities = (value) => value
  .replaceAll(/&nbsp;/gi, ' ')
  .replaceAll(/&amp;/gi, '&')
  .replaceAll(/&lt;/gi, '<')
  .replaceAll(/&gt;/gi, '>')
  .replaceAll(/&quot;/gi, '"')
  .replaceAll(/&#39;|&apos;/gi, "'");

/**
 * Electron native dialogs render plain text only. Normalize common HTML release-note
 * payloads to readable text instead of showing literal tags.
 *
 * @param {string} value
 * @returns {string}
 */
const normalizeReleaseNotesText = (value) => {
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
