import path from 'node:path';

const pad = (value, size) => String(value).padStart(size, '0');

const sanitizeSegment = (value) => value
  .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
  .replaceAll(/_+/g, '_')
  .replaceAll(/^_+|_+$/g, '');

export const formatClipTimestamp = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new TypeError('seconds must be a non-negative finite number');
  }

  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${pad(hours, 2)}-${pad(minutes, 2)}-${pad(remainingSeconds, 2)}`;
};

export const buildClipOutputName = ({
  sourcePath, clipIndex, range, extension = 'mp4',
}) => {
  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    throw new TypeError('sourcePath must be a non-empty string');
  }

  if (!Number.isInteger(clipIndex) || clipIndex < 0) {
    throw new TypeError('clipIndex must be a non-negative integer');
  }

  const parsed = path.parse(sourcePath);
  const safeBaseName = sanitizeSegment(parsed.name || 'clip');
  const safeExtension = sanitizeSegment(extension).replace(/^\./, '') || 'mp4';
  const indexSegment = pad(clipIndex + 1, 4);
  const startSegment = formatClipTimestamp(range.start);
  const endSegment = formatClipTimestamp(range.end);

  return `${safeBaseName}__${indexSegment}__${startSegment}_${endSegment}.${safeExtension}`;
};
