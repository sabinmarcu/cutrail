import {
  accessSync,
  constants,
} from 'node:fs';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

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

export const resolveFfmpegPath = ({
  env = process.env,
  bundledPath = ffmpegInstaller?.path,
  canExecuteImpl = canExecute,
} = {}) => {
  const envOverride = env.CUTRAIL_FFMPEG_PATH;

  if (canExecuteImpl(envOverride)) {
    return {
      path: envOverride,
      source: 'ENV_OVERRIDE',
    };
  }

  if (canExecuteImpl(bundledPath)) {
    return {
      path: bundledPath,
      source: 'BUNDLED',
    };
  }

  return {
    path: 'ffmpeg',
    source: 'SYSTEM_PATH',
  };
};
