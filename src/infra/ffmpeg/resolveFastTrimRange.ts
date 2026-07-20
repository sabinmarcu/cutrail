import { spawn } from 'node:child_process';
import { resolveFfprobeCandidates } from './resolveFfprobeCandidates.ts';

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

const readKeyframePoints = (inputPath: string): Promise<number[]> => new Promise((resolve) => {
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
  let stdout = '';
  const candidates = resolveFfprobeCandidates();

  const tryNextCandidate = (candidateIndex: number): void => {
    const ffprobePath = candidates[candidateIndex];

    if (!ffprobePath) {
      resolve([]);

      return;
    }

    stdout = '';

    const child = spawn(ffprobePath, ffprobeArguments, {
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });

    child.once('error', () => {
      tryNextCandidate(candidateIndex + 1);
    });

    child.once('close', (exitCode) => {
      if (exitCode !== 0) {
        tryNextCandidate(candidateIndex + 1);

        return;
      }

      const points = stdout
        .split(/\r?\n/u)
        .map((value) => toSeconds(value.trim()))
        .filter((value): value is number => value !== null)
        .sort((left, right) => left - right);

      resolve(points);
    });
  };

  tryNextCandidate(0);
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
