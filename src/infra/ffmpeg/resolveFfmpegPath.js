import {
  accessSync,
  constants,
} from 'node:fs';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const APP_ASAR_PATH_SEGMENT = /([\\/])app\.asar([\\/])/u;

const canExecute = (candidatePath) => {
  if (typeof candidatePath !== 'string' || candidatePath.trim().length === 0) {
    return false;
  }

  try {
    accessSync(candidatePath, constants.X_OK);

    return true;
  } catch {
    return false;
  }
};

const resolveExecutableCandidate = (candidatePath, canExecuteImpl) => {
  if (typeof candidatePath !== 'string' || candidatePath.trim().length === 0) {
    return null;
  }

  const trimmedCandidatePath = candidatePath.trim();

  if (APP_ASAR_PATH_SEGMENT.test(trimmedCandidatePath)) {
    const unpackedCandidatePath = trimmedCandidatePath.replace(
      APP_ASAR_PATH_SEGMENT,
      '$1app.asar.unpacked$2',
    );

    if (canExecuteImpl(unpackedCandidatePath)) {
      return unpackedCandidatePath;
    }

    return null;
  }

  if (canExecuteImpl(trimmedCandidatePath)) {
    return trimmedCandidatePath;
  }

  return null;
};

export const resolveFfmpegPath = ({
  env = process.env,
  bundledPath = ffmpegInstaller?.path,
  canExecuteImpl = canExecute,
} = {}) => {
  const envOverride = env.CUTRAIL_FFMPEG_PATH;
  const resolvedEnvOverride = resolveExecutableCandidate(envOverride, canExecuteImpl);

  if (resolvedEnvOverride) {
    return {
      path: resolvedEnvOverride,
      source: 'ENV_OVERRIDE',
    };
  }

  const resolvedBundledPath = resolveExecutableCandidate(bundledPath, canExecuteImpl);

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
