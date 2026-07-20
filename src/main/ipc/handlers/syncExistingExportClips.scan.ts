import {
  readdir,
  stat,
} from 'node:fs/promises';
import path from 'node:path';
import {
  createSourceFingerprint,
} from '../../../domain/exportMetadata.identity.ts';
import {
  createRangeKey,
  normalizeRangeMilliseconds,
} from '../../../domain/exportMetadata.normalize.ts';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../../../domain/outputName.ts';
import {
  existingExportClipsSnapshotSchema,
  type ExistingExportClipSnapshot,
} from '../../../shared/exportMetadata.ts';
import { readClipMetadata } from '../../../infra/ffmpeg/readClipMetadata.ts';

type ScanInput = {
  sourcePath: string;
  outputDirectory: string;
};

const buildClipFromLegacyParse = (
  fileName: string,
  filePath: string,
  modifiedAtMs: number,
  parsed: NonNullable<ReturnType<typeof parseClipOutputName>>,
): ExistingExportClipSnapshot => {
  const rangeMs = normalizeRangeMilliseconds(parsed.range);

  return {
    fileName,
    filePath,
    modifiedAtMs,
    sourceName: parsed.sourceName,
    trimMode: parsed.trimMode,
    range: parsed.range,
    extension: parsed.extension,
    metadata: null,
    metadataPresence: 'legacy',
    classificationKind: 'legacy',
    identityKeys: {
      clipId: null,
      planId: null,
      sourceFingerprint: null,
      variantKey: null,
      rangeKey: createRangeKey(rangeMs),
    },
    selectedAudioTrackIndices: [],
    mutedAudioTrackIndices: [],
  };
};

export const scanExistingExportClips = async ({
  sourcePath,
  outputDirectory,
}: ScanInput): Promise<ExistingExportClipSnapshot[]> => {
  const sourceName = normalizeClipSourceName(sourcePath);
  const sourceFingerprint = createSourceFingerprint(sourcePath);
  const entries = await readdir(outputDirectory, { withFileTypes: true });
  const clips: ExistingExportClipSnapshot[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const filePath = path.join(outputDirectory, entry.name);
      const fileStats = await stat(filePath).catch(() => null);
      const modifiedAtMs = fileStats?.mtimeMs ?? 0;
      const legacyParsed = parseClipOutputName(entry.name);
      const metadataReadback = await readClipMetadata(filePath).catch(() => null);

      if (metadataReadback?.metadata) {
        const { metadata } = metadataReadback;
        const clipRange = {
          start: metadata.rangeMs.startMs / 1000,
          end: metadata.rangeMs.endMs / 1000,
          duration: metadata.rangeMs.durationMs / 1000,
        };

        clips.push(existingExportClipsSnapshotSchema.shape.clips.element.parse({
          fileName: entry.name,
          filePath,
          modifiedAtMs,
          sourceName: legacyParsed?.sourceName ?? sourceName,
          trimMode: metadata.trimMode,
          range: clipRange,
          extension: path.extname(entry.name).replace('.', '') || legacyParsed?.extension || 'mp4',
          metadata,
          metadataPresence: metadata.sourceFingerprint === sourceFingerprint ? 'metadata' : 'foreign',
          classificationKind: metadata.sourceFingerprint === sourceFingerprint ? 'metadata' : 'foreign',
          identityKeys: {
            clipId: metadata.clipId,
            planId: metadata.planId,
            sourceFingerprint: metadata.sourceFingerprint,
            variantKey: metadata.variantKey,
            rangeKey: createRangeKey(metadata.rangeMs),
          },
          selectedAudioTrackIndices: metadata.selectedAudioTrackIndices,
          mutedAudioTrackIndices: metadata.mutedAudioTrackIndices,
        }));
      } else if (metadataReadback?.hasDiscoveryTags) {
        if (legacyParsed && legacyParsed.sourceName === sourceName) {
          clips.push(existingExportClipsSnapshotSchema.shape.clips.element.parse({
            ...buildClipFromLegacyParse(entry.name, filePath, modifiedAtMs, legacyParsed),
            metadataPresence: 'invalid',
            classificationKind: 'invalid',
          }));
        }
      } else if (legacyParsed && legacyParsed.sourceName !== sourceName) {
        clips.push(existingExportClipsSnapshotSchema.shape.clips.element.parse({
          ...buildClipFromLegacyParse(entry.name, filePath, modifiedAtMs, legacyParsed),
          metadataPresence: 'foreign',
          classificationKind: 'foreign',
        }));
      } else if (legacyParsed) {
        clips.push(existingExportClipsSnapshotSchema.shape.clips.element.parse(
          buildClipFromLegacyParse(entry.name, filePath, modifiedAtMs, legacyParsed),
        ));
      }
    }
  }

  const parsedSnapshot = existingExportClipsSnapshotSchema.parse({
    sourcePath,
    outputDirectory,
    clips,
  });

  return parsedSnapshot.clips;
};
