import { createHash } from 'node:crypto';
import path from 'node:path';

export type ClipRangeLike = { start: number; end: number; duration?: number };
export type BuildClipOutputNameInput = {
  sourcePath: string;
  range: ClipRangeLike;
  extension?: string;
  trimMode?: 'fast' | 'accurate';
  variantKey?: string;
};

type ParsedClipOutputName = {
  sourceName: string;
  trimMode: 'fast' | 'accurate';
  range: { start: number; end: number; duration: number };
  extension: string;
};

const pad = (value: string | number, size: number): string => String(value).padStart(size, '0');

const CLIP_OUTPUT_PATTERN = /^(?<sourceName>.+?)__(?<trimMode>fast|accurate)__(?<start>\d{2}-\d{2}-\d{2}(?:-\d{3})?)_(?<end>\d{2}-\d{2}-\d{2}(?:-\d{3})?)(?:__(?<variantSegment>v-[a-z0-9]+))?\.(?<extension>[^.]+)$/;

const sanitizeSegment = (value: string): string => value
  .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
  .replaceAll(/_+/g, '_')
  .replaceAll(/^_+|_+$/g, '');

const hashVariantKey = (variantKey: string): string => createHash('sha256')
  .update(variantKey)
  .digest('hex')
  .slice(0, 8);

const buildVariantFileSegment = (variantKey: string | undefined): string => {
  if (typeof variantKey !== 'string' || variantKey.trim().length === 0) {
    return '';
  }

  return `__v-${hashVariantKey(variantKey)}`;
};

export const normalizeClipSourceName = (sourcePath: string): string => sanitizeSegment(path.parse(sourcePath).name || 'clip');

export const formatClipTimestamp = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new TypeError('seconds must be a non-negative finite number');
  }

  const totalMilliseconds = Math.round(seconds * 1000);
  const wholeSeconds = Math.floor(totalMilliseconds / 1000);
  const milliseconds = totalMilliseconds % 1000;
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${pad(hours, 2)}-${pad(minutes, 2)}-${pad(remainingSeconds, 2)}-${pad(milliseconds, 3)}`;
};

export const parseClipTimestamp = (value: string): number | null => {
  if (typeof value !== 'string' || !/^\d{2}-\d{2}-\d{2}(?:-\d{3})?$/.test(value)) {
    return null;
  }

  const segments = value.split('-').map(Number);
  const [hours, minutes, seconds] = segments;
  const milliseconds = segments[3] ?? 0;

  if ([hours, minutes, seconds, milliseconds].some((segment) => !Number.isInteger(segment))) {
    return null;
  }

  return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
};

export const buildClipOutputName = ({
  sourcePath,
  range,
  extension = 'mp4',
  trimMode = 'fast',
  variantKey,
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
  const variantSegment = buildVariantFileSegment(variantKey);

  return `${safeBaseName}__${accuracySegment}__${startSegment}_${endSegment}${variantSegment}.${safeExtension}`;
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
