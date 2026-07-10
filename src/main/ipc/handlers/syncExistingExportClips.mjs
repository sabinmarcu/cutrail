// @ts-check

import { watch } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { ipcMain } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../../../domain/outputName.js';

const watcherByWebContentsId = new Map();

/**
 * @param {import('electron').WebContents} sender
 * @param {{ sourcePath: string, outputDirectory: string, clips: unknown[] }} payload
 * @returns {void}
 */
const sendExistingClipsUpdate = (sender, payload) => {
  if (sender.isDestroyed()) {
    return;
  }

  sender.send('cutrail:existing-export-clips-updated', payload);
};

/**
 * @param {import('electron').WebContents} sender
 * @param {number} webContentsId
 * @returns {void}
 */
const clearWatcher = (sender, webContentsId) => {
  const watcherState = watcherByWebContentsId.get(webContentsId);

  if (!watcherState) {
    return;
  }

  watcherState.watcher.close();

  if (watcherState.refreshTimer) {
    clearTimeout(watcherState.refreshTimer);
  }

  watcherByWebContentsId.delete(webContentsId);
  sendExistingClipsUpdate(sender, {
    sourcePath: '',
    outputDirectory: '',
    clips: [],
  });
};

/**
 * @param {import('electron').WebContents} sender
 * @param {{ sourcePath?: string, outputDirectory?: string }} payload
 * @returns {Promise<void>}
 */
const syncWatcherSnapshot = async (sender, payload) => {
  const sourcePath = typeof payload.sourcePath === 'string' ? payload.sourcePath : '';
  const outputDirectory = typeof payload.outputDirectory === 'string' ? payload.outputDirectory : '';

  if (sourcePath.length === 0 || outputDirectory.length === 0) {
    clearWatcher(sender, sender.id);

    return;
  }

  const webContentsId = sender.id;
  const sourceName = normalizeClipSourceName(sourcePath);
  const existingState = watcherByWebContentsId.get(webContentsId);

  if (existingState?.watchDirectory !== outputDirectory) {
    clearWatcher(sender, webContentsId);
  }

  const refreshSnapshot = async () => {
    try {
      const entries = await readdir(outputDirectory, { withFileTypes: true });
      const clips = entries
        .filter((entry) => entry.isFile())
        .map((entry) => {
          const parsed = parseClipOutputName(entry.name);

          if (!parsed || parsed.sourceName !== sourceName) {
            return null;
          }

          return {
            fileName: entry.name,
            filePath: path.join(outputDirectory, entry.name),
            ...parsed,
          };
        })
        .filter(Boolean);

      sendExistingClipsUpdate(sender, {
        sourcePath,
        outputDirectory,
        clips,
      });
    } catch {
      sendExistingClipsUpdate(sender, {
        sourcePath,
        outputDirectory,
        clips: [],
      });
    }
  };

  if (!watcherByWebContentsId.has(webContentsId)) {
    const watcherState = {
      watchDirectory: outputDirectory,
      refreshTimer: null,
      watcher: watch(outputDirectory, { persistent: false }, () => {
        const currentState = watcherByWebContentsId.get(webContentsId);

        if (!currentState) {
          return;
        }

        if (currentState.refreshTimer) {
          clearTimeout(currentState.refreshTimer);
        }

        currentState.refreshTimer = setTimeout(() => {
          void refreshSnapshot();
        }, 75);
      }),
    };

    watcherByWebContentsId.set(webContentsId, watcherState);
    sender.once('destroyed', () => {
      clearWatcher(sender, webContentsId);
    });
  } else {
    const watcherState = watcherByWebContentsId.get(webContentsId);

    if (watcherState) {
      watcherState.watchDirectory = outputDirectory;
    }
  }

  await refreshSnapshot();
};

/** @returns {void} */
const registerSyncExistingExportClipsHandler = () => {
  ipcMain.handle('cutrail:sync-existing-export-clips', async (event, payload) => {
    assertTrustedSender(event);
    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};

    await syncWatcherSnapshot(event.sender, nextPayload);

    return true;
  });
};

export {
  registerSyncExistingExportClipsHandler,
};

