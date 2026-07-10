import type { LibraryVideoEntry } from './LibraryWindow.types';

const SEEN_VIDEO_PATHS_KEY = 'cutrail:library-seen-video-paths';

const readSeenVideoPaths = (): { hasStoredPaths: boolean; seenPaths: Set<string> } => {
  try {
    const raw = globalThis.localStorage.getItem(SEEN_VIDEO_PATHS_KEY);

    if (!raw) {
      return {
        hasStoredPaths: false,
        seenPaths: new Set<string>(),
      };
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return {
        hasStoredPaths: false,
        seenPaths: new Set<string>(),
      };
    }

    return {
      hasStoredPaths: true,
      seenPaths: new Set(parsed.filter((value): value is string => typeof value === 'string')),
    };
  } catch {
    return {
      hasStoredPaths: false,
      seenPaths: new Set<string>(),
    };
  }
};

const writeSeenVideoPaths = (seenPaths: Set<string>): void => {
  try {
    globalThis.localStorage.setItem(SEEN_VIDEO_PATHS_KEY, JSON.stringify([...seenPaths]));
  } catch {
    // Ignore storage write failures.
  }
};

const resolveNewVideoPaths = (videos: LibraryVideoEntry[]): Set<string> => {
  const { hasStoredPaths, seenPaths } = readSeenVideoPaths();

  if (!hasStoredPaths) {
    return new Set<string>();
  }

  const newVideoPaths = new Set<string>();

  for (const video of videos) {
    if (!seenPaths.has(video.filePath)) {
      newVideoPaths.add(video.filePath);
    }
  }

  return newVideoPaths;
};

const persistSeenVideoPaths = (videos: LibraryVideoEntry[]): void => {
  const { seenPaths } = readSeenVideoPaths();

  for (const video of videos) {
    seenPaths.add(video.filePath);
  }

  writeSeenVideoPaths(seenPaths);
};

export {
  persistSeenVideoPaths,
  resolveNewVideoPaths,
};
