import { watch } from 'node:fs';
import type { FSWatcher } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
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
import { readClipMetadata } from '../../../infra/ffmpeg/readClipMetadata.ts';
import {
  createSourceFingerprint,
} from '../../../domain/exportMetadata.identity.ts';
import {
  normalizeClipSourceName,
  parseClipOutputName,
} from '../../../domain/outputName.ts';

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

const buildSourceClipKindMap = async (
  outputDirectory: string,
  sourcePathByFingerprint: Map<string, string>,
  sourcePathByName: Map<string, string>,
): Promise<Map<string, {
  hasLegacyClips: boolean;
  hasMetadataClips: boolean;
}>> => {
  const clipKindBySourcePath = new Map<string, {
    hasLegacyClips: boolean;
    hasMetadataClips: boolean;
  }>();
  const outputEntries = await readdir(outputDirectory, { withFileTypes: true });

  const ensureClipFlags = (sourcePath: string) => {
    const existing = clipKindBySourcePath.get(sourcePath);

    if (existing) {
      return existing;
    }

    const created = {
      hasLegacyClips: false,
      hasMetadataClips: false,
    };

    clipKindBySourcePath.set(sourcePath, created);

    return created;
  };

  for (const outputEntry of outputEntries) {
    if (outputEntry.isFile()) {
      const filePath = path.join(outputDirectory, outputEntry.name);
      const metadataReadback = await readClipMetadata(filePath).catch(() => null);
      const metadataSourceFingerprint = metadataReadback?.metadata?.sourceFingerprint;

      if (typeof metadataSourceFingerprint === 'string') {
        const sourcePath = sourcePathByFingerprint.get(metadataSourceFingerprint);

        if (sourcePath) {
          ensureClipFlags(sourcePath).hasMetadataClips = true;
        }
      } else {
        const parsedLegacyName = parseClipOutputName(outputEntry.name);

        if (parsedLegacyName) {
          const sourcePath = sourcePathByName.get(parsedLegacyName.sourceName);

          if (sourcePath) {
            ensureClipFlags(sourcePath).hasLegacyClips = true;
          }
        }
      }
    }
  }

  return clipKindBySourcePath;
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
  const sourcePathByFingerprint = new Map<string, string>();
  const sourcePathByName = new Map<string, string>();

  for (const video of videos) {
    sourcePathByFingerprint.set(createSourceFingerprint(video.filePath), video.filePath);
    sourcePathByName.set(normalizeClipSourceName(video.filePath), video.filePath);
  }

  let clipKindBySourcePath = new Map<string, {
    hasLegacyClips: boolean;
    hasMetadataClips: boolean;
  }>();

  if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
    clipKindBySourcePath = await buildSourceClipKindMap(
      outputDirectory,
      sourcePathByFingerprint,
      sourcePathByName,
    ).catch(() => new Map());
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
      const sourcePathByFingerprint = new Map<string, string>();
      const sourcePathByName = new Map<string, string>();

      for (const video of videos) {
        sourcePathByFingerprint.set(createSourceFingerprint(video.filePath), video.filePath);
        sourcePathByName.set(normalizeClipSourceName(video.filePath), video.filePath);
      }

      let clipKindBySourcePath = new Map<string, {
        hasLegacyClips: boolean;
        hasMetadataClips: boolean;
      }>();

      if (typeof outputDirectory === 'string' && outputDirectory.length > 0) {
        clipKindBySourcePath = await buildSourceClipKindMap(
          outputDirectory,
          sourcePathByFingerprint,
          sourcePathByName,
        ).catch(() => new Map());
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
