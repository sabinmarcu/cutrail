import path from 'node:path';

export type ClipRangeLike = { start: number; end: number; duration?: number };
export type BuildClipOutputNameInput = {
  sourcePath: string;
  range: ClipRangeLike;
  extension?: string;
  trimMode?: 'fast' | 'accurate';
};

type ParsedClipOutputName = {
  sourceName: string;
  trimMode: 'fast' | 'accurate';
  range: { start: number; end: number; duration: number };
  extension: string;
};

const pad = (value: string | number, size: number): string => String(value).padStart(size, '0');

const CLIP_OUTPUT_PATTERN = /^(?<sourceName>.+?)__(?<trimMode>fast|accurate)__(?<start>\d{2}-\d{2}-\d{2})_(?<end>\d{2}-\d{2}-\d{2})\.(?<extension>[^.]+)$/;

const sanitizeSegment = (value: string): string => value
  .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
  .replaceAll(/_+/g, '_')
  .replaceAll(/^_+|_+$/g, '');

export const normalizeClipSourceName = (sourcePath: string): string => sanitizeSegment(path.parse(sourcePath).name || 'clip');

export const formatClipTimestamp = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new TypeError('seconds must be a non-negative finite number');
  }

  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${pad(hours, 2)}-${pad(minutes, 2)}-${pad(remainingSeconds, 2)}`;
};

export const parseClipTimestamp = (value: string): number | null => {
  if (typeof value !== 'string' || !/^\d{2}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes, seconds] = value.split('-').map(Number);

  if ([hours, minutes, seconds].some((segment) => !Number.isInteger(segment))) {
    return null;
  }

  return (hours * 3600) + (minutes * 60) + seconds;
};

export const buildClipOutputName = ({
  sourcePath,
  range,
  extension = 'mp4',
  trimMode = 'fast',
}: BuildClipOutputNameInput): string => {
  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    throw new TypeError('sourcePath must be a non-empty string');
  }

  if (trimMode !== 'fast' && trimMode !== 'accurate') {
    throw new TypeError('trimMode must be either fast or accurate');
  }

  const safeBaseName = normalizeClipSourceName(sourcePath);
  const safeExtension = sanitizeSegment(extension).replace(/^\./, '') || 'mp4';
  const accuracySegment = sanitizeSegment(trimMode) || 'fast';
  const startSegment = formatClipTimestamp(range.start);
  const endSegment = formatClipTimestamp(range.end);

  return `${safeBaseName}__${accuracySegment}__${startSegment}_${endSegment}.${safeExtension}`;
};

export const parseClipOutputName = (fileName: string): ParsedClipOutputName | null => {
  if (typeof fileName !== 'string' || fileName.trim().length === 0) {
    return null;
  }

  const match = CLIP_OUTPUT_PATTERN.exec(path.basename(fileName));

  if (!match?.groups) {
    return null;
  }

  const start = parseClipTimestamp(match.groups.start);
  const end = parseClipTimestamp(match.groups.end);

  if (start === null || end === null || end < start) {
    return null;
  }

  return {
    sourceName: match.groups.sourceName,
    trimMode: match.groups.trimMode as 'fast' | 'accurate',
    range: {
      start,
      end,
      duration: end - start,
    },
    extension: match.groups.extension,
  };
};
