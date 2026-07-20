import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import type { ExistingExportClip } from '../../../shared/contracts.ts';
import { scanExistingExportClips } from './syncExistingExportClips.scan.ts';
import {
  emitOutputDirectorySnapshotUpdate,
  emitOutputDirectoryWatcherDegraded,
  emitOutputDirectoryWatcherStopped,
} from '../../watchers/outputDirectoryWatcher.ts';

type SyncPayload = {
  sourcePath?: string;
  outputDirectory?: string;
};

type ExistingClipsWatcherState = {
  watchDirectory: string;
  refreshTimer: NodeJS.Timeout | null;
  watcher: FSWatcher;
};

const watcherByWebContentsId = new Map<number, ExistingClipsWatcherState>();

/**
 * @param {import('electron').WebContents} sender
 * @param {{ sourcePath: string, outputDirectory: string, clips: unknown[] }} payload
 * @returns {void}
 */
const sendExistingClipsUpdate = (
  sender: WebContents,
  payload: { sourcePath: string; outputDirectory: string; clips: ExistingExportClip[] },
): void => {
  if (sender.isDestroyed()) {
    return;
  }

  sender.send('cutrail:existing-export-clips-updated', payload);
  emitOutputDirectorySnapshotUpdate({
    sender,
    sourcePath: payload.sourcePath,
    outputDirectory: payload.outputDirectory,
    clips: payload.clips,
  });
};

/**
 * @param {import('electron').WebContents} sender
 * @param {number} webContentsId
 * @returns {void}
 */
const clearWatcher = (sender: WebContents, webContentsId: number): void => {
  const watcherState = watcherByWebContentsId.get(webContentsId);

  if (!watcherState) {
    return;
  }

  watcherState.watcher.close();

  if (watcherState.refreshTimer) {
    clearTimeout(watcherState.refreshTimer);
  }

  watcherByWebContentsId.delete(webContentsId);
  emitOutputDirectoryWatcherStopped({
    sender,
    reason: 'output-watcher-cleared',
  });
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
const syncWatcherSnapshot = async (
  sender: WebContents,
  payload: SyncPayload,
): Promise<void> => {
  const sourcePath = typeof payload.sourcePath === 'string' ? payload.sourcePath : '';
  const outputDirectory = typeof payload.outputDirectory === 'string' ? payload.outputDirectory : '';

  if (sourcePath.length === 0 || outputDirectory.length === 0) {
    clearWatcher(sender, sender.id);

    return;
  }

  const webContentsId = sender.id;
  const existingState = watcherByWebContentsId.get(webContentsId);

  if (existingState?.watchDirectory !== outputDirectory) {
    clearWatcher(sender, webContentsId);
  }

  const refreshSnapshot = async () => {
    try {
      const clips = await scanExistingExportClips({
        sourcePath,
        outputDirectory,
      });

      sendExistingClipsUpdate(sender, {
        sourcePath,
        outputDirectory,
        clips,
      });
    } catch {
      emitOutputDirectoryWatcherDegraded({
        sender,
        reason: 'output-directory-snapshot-refresh-failed',
      });

      sendExistingClipsUpdate(sender, {
        sourcePath,
        outputDirectory,
        clips: [],
      });
    }
  };

  if (!watcherByWebContentsId.has(webContentsId)) {
    /** @type {ExistingClipsWatcherState} */
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
          refreshSnapshot();
        }, 75);
      }),
    };

    watcherByWebContentsId.set(webContentsId, watcherState);
    sender.once('destroyed', () => {
      emitOutputDirectoryWatcherStopped({
        sender,
        reason: 'webcontents-destroyed',
      });
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
    const nextPayload: SyncPayload = typeof payload === 'object' && payload !== null
      ? payload as SyncPayload
      : {};

    await syncWatcherSnapshot(event.sender, nextPayload);

    return true;
  });
};

export {
  registerSyncExistingExportClipsHandler,
};

