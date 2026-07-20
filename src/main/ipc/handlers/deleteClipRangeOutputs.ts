import {
  readdir,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { createSourceFingerprint } from '../../../domain/exportMetadata.identity.ts';
import { normalizeRangeMilliseconds } from '../../../domain/exportMetadata.normalize.ts';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../../../domain/outputName.ts';
import { readClipMetadata } from '../../../infra/ffmpeg/readClipMetadata.ts';

type ClipRangeLike = { start: number; end: number };

/**
 * @param {ClipRangeLike} range
 * @returns {string}
 */
const buildRangeLookupKey = (range: ClipRangeLike): string => `${Math.floor(range.start)}:${Math.floor(range.end)}`;

const buildRangeLookupKeyFromMilliseconds = (range: { startMs: number; endMs: number }): string => (
  `${range.startMs}:${range.endMs}`
);

/** @returns {void} */
const registerDeleteClipRangeOutputsHandler = () => {
  ipcMain.handle('cutrail:delete-clip-range-outputs', async (event, payload) => {
    assertTrustedSender(event);
    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const sourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath : '';
    const outputDirectory = typeof nextPayload.outputDirectory === 'string' ? nextPayload.outputDirectory : '';
    const range: { start?: number | string; end?: number | string } = typeof nextPayload.range === 'object' && nextPayload.range !== null
      ? nextPayload.range as { start?: number | string; end?: number | string }
      : {};
    const start = typeof range.start === 'number' ? range.start : Number(range.start);
    const end = typeof range.end === 'number' ? range.end : Number(range.end);

    if (
      sourcePath.length === 0
      || outputDirectory.length === 0
      || !Number.isFinite(start)
      || !Number.isFinite(end)
    ) {
      return {
        ok: false,
        deletedCount: 0,
        error: 'invalid-delete-clip-range-request',
      };
    }

    const sourceName = normalizeClipSourceName(sourcePath);
    const sourceFingerprint = createSourceFingerprint(sourcePath);
    const targetRangeKey = buildRangeLookupKey({
      start,
      end,
    });
    const targetRangeMsKey = buildRangeLookupKeyFromMilliseconds(
      normalizeRangeMilliseconds({
        start,
        end,
      }),
    );

    try {
      const entries = await readdir(outputDirectory, { withFileTypes: true });
      const maybeMatchingPaths = await Promise.all(entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const filePath = path.join(outputDirectory, entry.name);
          const metadataReadback = await readClipMetadata(filePath).catch(() => null);

          if (metadataReadback?.metadata) {
            const { metadata } = metadataReadback;

            const metadataRangeKey = buildRangeLookupKeyFromMilliseconds({
              startMs: metadata.rangeMs.startMs,
              endMs: metadata.rangeMs.endMs,
            });

            if (
              metadata.sourceFingerprint === sourceFingerprint
              && metadataRangeKey === targetRangeMsKey
            ) {
              return filePath;
            }
          }

          const parsed = parseClipOutputName(entry.name);

          if (
            !parsed
            || parsed.sourceName !== sourceName
            || buildRangeLookupKey(parsed.range) !== targetRangeKey
          ) {
            return null;
          }

          return filePath;
        }));
      const matchingPaths = maybeMatchingPaths.filter(
        (candidate): candidate is string => (
          typeof candidate === 'string' && candidate.length > 0
        ),
      );

      await Promise.all(matchingPaths.map((filePath) => unlink(filePath)));

      return {
        ok: true,
        deletedCount: matchingPaths.length,
      };
    } catch (error) {
      return {
        ok: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'delete-clip-range-failed',
      };
    }
  });
};

export {
  registerDeleteClipRangeOutputsHandler,
};
