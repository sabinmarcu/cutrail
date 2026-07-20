import {
  accessSync,
  constants,
} from 'node:fs';

const APP_ASAR_PATH_SEGMENT = /([\\/])app\.asar([\\/])/u;

export const resolveAsarAwarePath = (candidatePath: string | undefined): string | null => {
  if (typeof candidatePath !== 'string' || candidatePath.trim().length === 0) {
    return null;
  }

  const trimmedCandidatePath = candidatePath.trim();

  return APP_ASAR_PATH_SEGMENT.test(trimmedCandidatePath)
    ? trimmedCandidatePath.replace(APP_ASAR_PATH_SEGMENT, '$1app.asar.unpacked$2')
    : trimmedCandidatePath;
};

export const canExecutePath = (candidatePath: string): boolean => {
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

export const resolveExecutableCandidate = (
  candidatePath: string | undefined,
  canExecuteImpl: (path: string) => boolean = canExecutePath,
): string | null => {
  const resolvedCandidatePath = resolveAsarAwarePath(candidatePath);

  if (!resolvedCandidatePath) {
    return null;
  }

  return canExecuteImpl(resolvedCandidatePath) ? resolvedCandidatePath : null;
};
