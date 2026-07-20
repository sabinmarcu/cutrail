import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { readSourceVideos } from '../../videoLibrary.ts';

type GetVideoLibraryDeps = {
  getPersistedOutputDirectory: () => Promise<string | null>;
  getPersistedSourceDirectory: () => Promise<string | null>;
};

type DirectoryWatcherState = {
  outputDirectory: string | null;
  outputWatcher: FSWatcher | null;
  outputTimer: NodeJS.Timeout | null;
  sourceDirectory: string | null;
  sourceWatcher: FSWatcher | null;
  sourceTimer: NodeJS.Timeout | null;
};

const watcherStateByWebContentsId = new Map<number, DirectoryWatcherState>();

const createDirectoryWatcherState = (): DirectoryWatcherState => ({
  outputDirectory: null,
  outputWatcher: null,
  outputTimer: null,
  sourceDirectory: null,
  sourceWatcher: null,
  sourceTimer: null,
});

const clearDirectoryWatchers = (webContentsId: number): void => {
  const current = watcherStateByWebContentsId.get(webContentsId);

  if (!current) {
    return;
  }

  current.sourceWatcher?.close();
  current.outputWatcher?.close();

  if (current.sourceTimer) {
    clearTimeout(current.sourceTimer);
  }

  if (current.outputTimer) {
    clearTimeout(current.outputTimer);
  }

  watcherStateByWebContentsId.delete(webContentsId);
};

const ensureDirectoryWatchers = (
  sender: WebContents,
  sourceDirectory: string | null,
  outputDirectory: string | null,
): void => {
  const webContentsId = sender.id;
  const state = watcherStateByWebContentsId.get(webContentsId) ?? createDirectoryWatcherState();

  if (state.sourceDirectory !== sourceDirectory) {
    state.sourceWatcher?.close();
    state.sourceDirectory = sourceDirectory;
    state.sourceWatcher = null;

    if (typeof sourceDirectory === 'string' && sourceDirectory.length > 0) {
      state.sourceWatcher = watch(sourceDirectory, { persistent: false }, () => {
        if (state.sourceTimer) {
          clearTimeout(state.sourceTimer);
        }

        state.sourceTimer = setTimeout(() => {
          if (!sender.isDestroyed()) {
            sender.send('cutrail:source-directory-updated', sourceDirectory);
          }
        }, 100);
      });
    }
  }

  if (state.outputDirectory !== outputDirectory) {
    state.outputWatcher?.close();
    state.outputDirectory = outputDirectory;
    state.outputWatcher = null;

    if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
      state.outputWatcher = watch(outputDirectory, { persistent: false }, () => {
        if (state.outputTimer) {
          clearTimeout(state.outputTimer);
        }

        state.outputTimer = setTimeout(() => {
          if (!sender.isDestroyed()) {
            sender.send('cutrail:output-directory-updated', outputDirectory);
          }
        }, 100);
      });
    }
  }

  watcherStateByWebContentsId.set(webContentsId, state);
};

const registerGetVideoLibraryHandler = ({
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
}: GetVideoLibraryDeps): void => {
  ipcMain.handle('cutrail:get-video-library', async (event) => {
    assertTrustedSender(event);
    if (!watcherStateByWebContentsId.has(event.sender.id)) {
      event.sender.once('destroyed', () => {
        clearDirectoryWatchers(event.sender.id);
      });
    }

    const sourceDirectory = await getPersistedSourceDirectory();
    const outputDirectory = await getPersistedOutputDirectory();

    ensureDirectoryWatchers(event.sender, sourceDirectory, outputDirectory);

    if (!sourceDirectory) {
      return {
        sourceDirectory: '',
        outputDirectory: outputDirectory ?? '',
        videos: [],
      };
    }

    try {
      const videos = await readSourceVideos(sourceDirectory, outputDirectory);

      return {
        sourceDirectory,
        outputDirectory: outputDirectory ?? '',
        videos,
      };
    } catch {
      return {
        sourceDirectory,
        outputDirectory: outputDirectory ?? '',
        videos: [],
      };
    }
  });
};

export {
  registerGetVideoLibraryHandler,
};
