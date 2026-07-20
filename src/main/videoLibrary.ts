import path from 'node:path';
import {
  readdir,
  stat,
} from 'node:fs/promises';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../domain/outputName.ts';
import { createSourceFingerprint } from '../domain/exportMetadata.identity.ts';
import { readClipMetadata } from '../infra/ffmpeg/readClipMetadata.ts';

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

const readClipCounts = async (
  outputDirectory: string,
  sourceNameByFingerprint: Map<string, string>,
): Promise<Map<string, number>> => {
  const entries = await readdir(outputDirectory, { withFileTypes: true });
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (entry.isFile()) {
      const parsed = parseClipOutputName(entry.name);

      if (parsed) {
        counts.set(parsed.sourceName, (counts.get(parsed.sourceName) ?? 0) + 1);
      } else {
        const filePath = path.join(outputDirectory, entry.name);
        const metadataReadback = await readClipMetadata(filePath).catch(() => null);
        const sourceFingerprint = metadataReadback?.metadata?.sourceFingerprint;

        if (typeof sourceFingerprint === 'string') {
          const sourceName = sourceNameByFingerprint.get(sourceFingerprint);

          if (sourceName) {
            counts.set(sourceName, (counts.get(sourceName) ?? 0) + 1);
          }
        }
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
  const sourceNameByFingerprint = new Map<string, string>();
  const videoCandidates: Array<{ sourceName: string; entry: VideoLibraryEntry }> = [];
  let clipCountsBySourceName = new Map<string, number>();

  for (const entry of sourceEntries) {
    if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();

      if (VIDEO_EXTENSIONS.has(extension)) {
        const filePath = path.join(sourceDirectory, entry.name);

        try {
          const details = await stat(filePath);
          const sourceName = normalizeClipSourceName(filePath);
          const sourceFingerprint = createSourceFingerprint(filePath);

          sourceNameByFingerprint.set(sourceFingerprint, sourceName);

          videoCandidates.push({
            sourceName,
            entry: {
              fileName: entry.name,
              filePath,
              extension,
              sizeBytes: details.size,
              createdAtMs: details.birthtimeMs,
              modifiedAtMs: details.mtimeMs,
              clipCount: 0,
            },
          });
        } catch {
          // Ignore entries that disappear between directory scan and stat.
        }
      }
    }
  }

  if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
    try {
      clipCountsBySourceName = await readClipCounts(outputDirectory, sourceNameByFingerprint);
    } catch {
      clipCountsBySourceName = new Map<string, number>();
    }
  }

  const videos = videoCandidates.map((candidate) => ({
    ...candidate.entry,
    clipCount: clipCountsBySourceName.get(candidate.sourceName) ?? 0,
  }));

  return videos;
};

export {
  readSourceVideos,
};
