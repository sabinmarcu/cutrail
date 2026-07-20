import {
  accessSync,
  constants,
} from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { resolveFfmpegPath } from './resolveFfmpegPath.ts';

export type TrimRange = { start: number; duration: number };
export type ResolveFastTrimRangeInput = {
  inputPath: string;
  range: TrimRange;
};

const toSeconds = (value: unknown): number | null => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

const APP_ASAR_PATH_SEGMENT = /([\\/])app\.asar([\\/])/u;

const resolveExecutablePath = (candidatePath: string | undefined): string | null => {
  if (typeof candidatePath !== 'string' || candidatePath.trim().length === 0) {
    return null;
  }

  const trimmedCandidatePath = candidatePath.trim();
  const resolvedCandidatePath = APP_ASAR_PATH_SEGMENT.test(trimmedCandidatePath)
    ? trimmedCandidatePath.replace(APP_ASAR_PATH_SEGMENT, '$1app.asar.unpacked$2')
    : trimmedCandidatePath;

  try {
    accessSync(resolvedCandidatePath, constants.X_OK);

    return resolvedCandidatePath;
  } catch {
    return null;
  }
};

const resolveFfprobePath = (): string => {
  const installedFfprobePath = resolveExecutablePath(ffprobeInstaller?.path);

  if (installedFfprobePath) {
    return installedFfprobePath;
  }

  const ffmpegPath = resolveFfmpegPath().path;
  const extension = path.extname(ffmpegPath);
  const siblingFfprobePath = path.join(path.dirname(ffmpegPath), `ffprobe${extension}`);

  const resolvedSiblingFfprobePath = resolveExecutablePath(siblingFfprobePath);

  if (resolvedSiblingFfprobePath) {
    return resolvedSiblingFfprobePath;
  }

  return 'ffprobe';
};

const readKeyframePoints = (inputPath: string): Promise<number[]> => new Promise((resolve) => {
  const ffprobePath = resolveFfprobePath();
  const ffprobeArguments = [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-skip_frame',
    'nokey',
    '-show_entries',
    'frame=pts_time',
    '-of',
    'csv=p=0',
    inputPath,
  ];
  const child = spawn(ffprobePath, ffprobeArguments, {
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  let stdout = '';

  child.stdout.on('data', (chunk) => {
    stdout += String(chunk);
  });

  child.once('error', () => {
    resolve([]);
  });

  child.once('close', (exitCode) => {
    if (exitCode !== 0) {
      resolve([]);

      return;
    }

    const points = stdout
      .split(/\r?\n/u)
      .map((value) => toSeconds(value.trim()))
      .filter((value): value is number => value !== null)
      .sort((left, right) => left - right);

    resolve(points);
  });
});

const resolveSafeStartPoint = (
  points: number[],
  start: number,
): number => {
  if (points.length === 0) {
    return start;
  }

  let safeStart = points[0] ?? start;

  for (const point of points) {
    if (point <= start) {
      safeStart = point;
    }
  }

  return safeStart;
};

const resolveSafeEndPoint = (
  points: number[],
  end: number,
): number => {
  if (points.length === 0) {
    return end;
  }

  for (const point of points) {
    if (point >= end) {
      return point;
    }
  }

  return end;
};

export const resolveSnappedTrimRange = (
  points: number[],
  range: TrimRange,
): TrimRange => {
  if (!Number.isFinite(range.start) || !Number.isFinite(range.duration) || range.duration <= 0) {
    return range;
  }

  const requestedStart = Math.max(0, range.start);
  const requestedEnd = requestedStart + range.duration;
  const safeStart = resolveSafeStartPoint(points, requestedStart);
  const safeEnd = resolveSafeEndPoint(points, requestedEnd);

  return {
    start: safeStart,
    duration: Math.max(0.001, safeEnd - safeStart),
  };
};

export const resolveFastTrimRange = async ({
  inputPath,
  range,
}: ResolveFastTrimRangeInput): Promise<TrimRange> => {
  const keyframes = await readKeyframePoints(inputPath);

  return resolveSnappedTrimRange(keyframes, range);
};
