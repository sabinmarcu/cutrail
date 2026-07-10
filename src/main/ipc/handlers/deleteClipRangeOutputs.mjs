// @ts-check

import {
  readdir,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../../../domain/outputName.js';

const buildRangeLookupKey = (range) => `${Math.floor(range.start)}:${Math.floor(range.end)}`;

/** @returns {void} */
const registerDeleteClipRangeOutputsHandler = () => {
  ipcMain.handle('cutrail:delete-clip-range-outputs', async (event, payload) => {
    assertTrustedSender(event);
    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const sourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath : '';
    const outputDirectory = typeof nextPayload.outputDirectory === 'string' ? nextPayload.outputDirectory : '';
    const range = typeof nextPayload.range === 'object' && nextPayload.range !== null ? nextPayload.range : {};
    const start = typeof range.start === 'number' ? range.start : Number(range.start);
    const end = typeof range.end === 'number' ? range.end : Number(range.end);

    if (sourcePath.length === 0 || outputDirectory.length === 0 || !Number.isFinite(start) || !Number.isFinite(end)) {
      return {
        ok: false,
        deletedCount: 0,
        error: 'invalid-delete-clip-range-request',
      };
    }

    const sourceName = normalizeClipSourceName(sourcePath);
    const targetRangeKey = buildRangeLookupKey({
      start,
      end,
    });

    try {
      const entries = await readdir(outputDirectory, { withFileTypes: true });
      const matchingPaths = entries
        .filter((entry) => entry.isFile())
        .map((entry) => {
          const parsed = parseClipOutputName(entry.name);

          if (!parsed || parsed.sourceName !== sourceName || buildRangeLookupKey(parsed.range) !== targetRangeKey) {
            return null;
          }

          return path.join(outputDirectory, entry.name);
        })
        .filter(Boolean);

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
