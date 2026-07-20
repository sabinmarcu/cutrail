import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';
import { ipcMain } from 'electron';
import type { WebContents } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { readSourceVideos } from '../../videoLibrary.ts';
import {
  clearWatcherState,
} from '../../watchers/watcherRegistry.ts';
import {
  emitSourceDirectorySnapshotUpdate,
  emitSourceDirectoryWatcherDegraded,
  emitSourceDirectoryWatcherStopped,
} from '../../watchers/sourceDirectoryWatcher.ts';
import { scanExistingExportClips } from './syncExistingExportClips.scan.ts';

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
  clearWatcherState(webContentsId);
};

const emitSourceSnapshotForLibrary = async ({
  sender,
  sourceDirectory,
  outputDirectory,
}: {
  sender: WebContents;
  sourceDirectory: string;
  outputDirectory: string | null;
}): Promise<void> => {
  const videos = await readSourceVideos(sourceDirectory, outputDirectory);
  const clipKindBySourcePath = new Map<string, {
    hasLegacyClips: boolean;
    hasMetadataClips: boolean;
  }>();

  if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
    await Promise.all(videos.map(async (video) => {
      const clips = await scanExistingExportClips({
        sourcePath: video.filePath,
        outputDirectory,
      }).catch(() => []);

      clipKindBySourcePath.set(video.filePath, {
        hasLegacyClips: clips.some((clip) => clip.classificationKind === 'legacy'),
        hasMetadataClips: clips.some((clip) => clip.classificationKind === 'metadata'),
      });
    }));
  }

  emitSourceDirectorySnapshotUpdate({
    sender,
    sourceDirectory,
    videos: videos.map((video) => ({
      filePath: video.filePath,
      fileName: video.fileName,
      extension: video.extension,
      modifiedAtMs: video.modifiedAtMs,
      clipCount: video.clipCount,
      hasMetadataClips: clipKindBySourcePath.get(video.filePath)?.hasMetadataClips ?? false,
      hasLegacyClips: clipKindBySourcePath.get(video.filePath)?.hasLegacyClips ?? false,
    })),
  });
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
            emitSourceSnapshotForLibrary({
              sender,
              sourceDirectory,
              outputDirectory: state.outputDirectory,
            }).catch(() => {
              emitSourceDirectoryWatcherDegraded({
                sender,
                reason: 'source-directory-snapshot-refresh-failed',
              });
            });
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
        emitSourceDirectoryWatcherStopped({
          sender: event.sender,
          reason: 'webcontents-destroyed',
        });
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
      const clipKindBySourcePath = new Map<string, {
        hasLegacyClips: boolean;
        hasMetadataClips: boolean;
      }>();

      if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
        await Promise.all(videos.map(async (video) => {
          const clips = await scanExistingExportClips({
            sourcePath: video.filePath,
            outputDirectory,
          }).catch(() => []);

          clipKindBySourcePath.set(video.filePath, {
            hasLegacyClips: clips.some((clip) => clip.classificationKind === 'legacy'),
            hasMetadataClips: clips.some((clip) => clip.classificationKind === 'metadata'),
          });
        }));
      }

      emitSourceDirectorySnapshotUpdate({
        sender: event.sender,
        sourceDirectory,
        videos: videos.map((video) => ({
          filePath: video.filePath,
          fileName: video.fileName,
          extension: video.extension,
          modifiedAtMs: video.modifiedAtMs,
          clipCount: video.clipCount,
          hasMetadataClips: clipKindBySourcePath.get(video.filePath)?.hasMetadataClips ?? false,
          hasLegacyClips: clipKindBySourcePath.get(video.filePath)?.hasLegacyClips ?? false,
        })),
      });

      return {
        sourceDirectory,
        outputDirectory: outputDirectory ?? '',
        videos,
      };
    } catch {
      emitSourceDirectoryWatcherDegraded({
        sender: event.sender,
        reason: 'initial-source-directory-snapshot-failed',
      });

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
