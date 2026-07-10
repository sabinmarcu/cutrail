import path from 'node:path';
import {
  readdir,
  stat,
} from 'node:fs/promises';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../domain/outputName.ts';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.mkv', '.webm', '.mov', '.avi']);

type VideoLibraryEntry = {
  fileName: string;
  filePath: string;
  extension: string;
  sizeBytes: number;
  createdAtMs: number;
  modifiedAtMs: number;
  clipCount: number;
};

const readClipCounts = async (outputDirectory: string): Promise<Map<string, number>> => {
  const entries = await readdir(outputDirectory, { withFileTypes: true });
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (entry.isFile()) {
      const parsed = parseClipOutputName(entry.name);

      if (parsed) {
        counts.set(parsed.sourceName, (counts.get(parsed.sourceName) ?? 0) + 1);
      }
    }
  }

  return counts;
};

const readSourceVideos = async (
  sourceDirectory: string,
  outputDirectory: string | null,
): Promise<VideoLibraryEntry[]> => {
  const sourceEntries = await readdir(sourceDirectory, { withFileTypes: true });
  let clipCountsBySourceName = new Map<string, number>();

  if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
    try {
      clipCountsBySourceName = await readClipCounts(outputDirectory);
    } catch {
      clipCountsBySourceName = new Map<string, number>();
    }
  }

  const videos: VideoLibraryEntry[] = [];

  for (const entry of sourceEntries) {
    if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();

      if (VIDEO_EXTENSIONS.has(extension)) {
        const filePath = path.join(sourceDirectory, entry.name);

        try {
          const details = await stat(filePath);
          const sourceName = normalizeClipSourceName(filePath);

          videos.push({
            fileName: entry.name,
            filePath,
            extension,
            sizeBytes: details.size,
            createdAtMs: details.birthtimeMs,
            modifiedAtMs: details.mtimeMs,
            clipCount: clipCountsBySourceName.get(sourceName) ?? 0,
          });
        } catch {
          // Ignore entries that disappear between directory scan and stat.
        }
      }
    }
  }

  return videos;
};

export {
  readSourceVideos,
};
