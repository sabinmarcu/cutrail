import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { spawnSync } from 'node:child_process';
import { parseEnvironment } from '../env.ts';
import {
  getFfmpegResolutionMode,
  type BinaryResolutionMode,
} from './ffmpegResolutionPreferences.ts';
import {
  canExecutePath,
  resolveExecutableCandidate,
} from './resolveExecutableCandidate.ts';

export type FfmpegPathSource = 'ENV_OVERRIDE' | 'BUNDLED' | 'SYSTEM_PATH';
export type ResolvedFfmpegPath = { path: string; source: FfmpegPathSource };

export type ResolveFfmpegPathOptions = {
  env?: NodeJS.ProcessEnv;
  bundledPath?: string;
  canExecuteImpl?: (path: string) => boolean;
  canResolveSystemCommandImpl?: (command: string) => boolean;
  resolutionMode?: BinaryResolutionMode;
};

const canResolveSystemCommand = (command: string): boolean => {
  try {
    const result = spawnSync(command, ['-version'], {
      stdio: 'ignore',
    });

    return typeof result.error === 'undefined';
  } catch {
    return false;
  }
};

export const resolveFfmpegPath = ({
  env = process.env,
  bundledPath = ffmpegInstaller?.path,
  canExecuteImpl = canExecutePath,
  canResolveSystemCommandImpl = canResolveSystemCommand,
  resolutionMode = getFfmpegResolutionMode(),
}: ResolveFfmpegPathOptions = {}): ResolvedFfmpegPath => {
  const { ffmpegOverridePath: envOverride } = parseEnvironment(env);
  const resolvedEnvOverride = resolveExecutableCandidate(envOverride, canExecuteImpl);

  if (resolvedEnvOverride) {
    return {
      path: resolvedEnvOverride,
      source: 'ENV_OVERRIDE',
    };
  }

  const resolvedBundledPath = resolveExecutableCandidate(bundledPath, canExecuteImpl);
  const canUseSystemCommand = canResolveSystemCommandImpl('ffmpeg');

  if (resolutionMode === 'bundled') {
    if (resolvedBundledPath) {
      return {
        path: resolvedBundledPath,
        source: 'BUNDLED',
      };
    }

    return {
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    };
  }

  if (canUseSystemCommand) {
    return {
      path: 'ffmpeg',
      source: 'SYSTEM_PATH',
    };
  }

  if (resolvedBundledPath) {
    return {
      path: resolvedBundledPath,
      source: 'BUNDLED',
    };
  }

  return {
    path: 'ffmpeg',
    source: 'SYSTEM_PATH',
  };
};
