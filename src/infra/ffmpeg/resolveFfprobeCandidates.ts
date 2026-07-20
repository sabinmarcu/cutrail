import path from 'node:path';

import ffprobeInstaller from '@ffprobe-installer/ffprobe';

import { resolveFfmpegPath } from './resolveFfmpegPath.ts';
import {
  getFfprobeResolutionMode,
  type BinaryResolutionMode,
} from './ffmpegResolutionPreferences.ts';
import { resolveAsarAwarePath } from './resolveExecutableCandidate.ts';

const dedupeCandidates = (candidates: Array<string | null>): string[] => {
  const resolved: string[] = [];

  for (const candidate of candidates) {
    if (candidate && !resolved.includes(candidate)) {
      resolved.push(candidate);
    }
  }

  return resolved;
};

const buildFfprobeCandidates = (
  mode: BinaryResolutionMode,
  ffmpegPath: string,
): string[] => {
  const extension = path.extname(ffmpegPath);
  const siblingPath = resolveAsarAwarePath(
    path.join(path.dirname(ffmpegPath), `ffprobe${extension}`),
  );
  const bundledPath = resolveAsarAwarePath(ffprobeInstaller?.path);
  const systemPath = 'ffprobe';

  if (mode === 'bundled') {
    return dedupeCandidates([siblingPath, bundledPath, systemPath]);
  }

  return dedupeCandidates([systemPath, siblingPath, bundledPath]);
};

export const resolveFfprobeCandidates = (): string[] => {
  const mode = getFfprobeResolutionMode();
  const ffmpegPath = resolveFfmpegPath().path;

  return buildFfprobeCandidates(mode, ffmpegPath);
};
