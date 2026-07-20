import type { ExistingExportClip } from '../../shared/contracts.ts';
import type {
  SourceDirectoryEntry,
  WatcherChangeSummary,
} from '../../shared/watcherEvents.ts';

type WatcherState = {
  outputSnapshotByClipPath: Map<string, string>;
  sourceSnapshotRevision: number;
  sourceSnapshotByVideoPath: Map<string, string>;
  outputSnapshotRevision: number;
};

const watcherStateByWebContentsId = new Map<number, WatcherState>();

const getOrCreateWatcherState = (webContentsId: number): WatcherState => {
  const existing = watcherStateByWebContentsId.get(webContentsId);

  if (existing) {
    return existing;
  }

  const created: WatcherState = {
    outputSnapshotByClipPath: new Map<string, string>(),
    sourceSnapshotRevision: 0,
    sourceSnapshotByVideoPath: new Map<string, string>(),
    outputSnapshotRevision: 0,
  };

  watcherStateByWebContentsId.set(webContentsId, created);

  return created;
};

const nextSourceSnapshotRevision = (webContentsId: number): number => {
  const state = getOrCreateWatcherState(webContentsId);

  state.sourceSnapshotRevision += 1;

  return state.sourceSnapshotRevision;
};

const nextOutputSnapshotRevision = (webContentsId: number): number => {
  const state = getOrCreateWatcherState(webContentsId);

  state.outputSnapshotRevision += 1;

  return state.outputSnapshotRevision;
};

const buildSourceSnapshotSignature = (video: SourceDirectoryEntry): string => JSON.stringify({
  clipCount: video.clipCount,
  extension: video.extension,
  fileName: video.fileName,
  hasLegacyClips: video.hasLegacyClips,
  hasMetadataClips: video.hasMetadataClips,
  modifiedAtMs: video.modifiedAtMs,
});

const buildOutputSnapshotSignature = (clip: ExistingExportClip): string => JSON.stringify({
  classificationKind: clip.classificationKind ?? 'legacy',
  identityKeys: clip.identityKeys ?? null,
  metadataPresence: clip.metadataPresence ?? 'legacy',
  modifiedAtMs: clip.modifiedAtMs,
  mutedAudioTrackIndices: clip.mutedAudioTrackIndices ?? [],
  range: clip.range,
  selectedAudioTrackIndices: clip.selectedAudioTrackIndices ?? [],
  trimMode: clip.trimMode,
});

const computeChangeSummary = (
  previousSnapshot: Map<string, string>,
  nextSnapshot: Map<string, string>,
): WatcherChangeSummary => {
  let added = 0;
  let changed = 0;
  let removed = 0;

  for (const [key, nextSignature] of nextSnapshot.entries()) {
    const previousSignature = previousSnapshot.get(key);

    if (typeof previousSignature !== 'string') {
      added += 1;
    } else if (previousSignature !== nextSignature) {
      changed += 1;
    }
  }

  for (const key of previousSnapshot.keys()) {
    if (!nextSnapshot.has(key)) {
      removed += 1;
    }
  }

  return {
    added,
    changed,
    removed,
  };
};

const updateSourceSnapshotChangeSummary = (
  webContentsId: number,
  videos: SourceDirectoryEntry[],
): WatcherChangeSummary => {
  const state = getOrCreateWatcherState(webContentsId);
  const nextSnapshot = new Map<string, string>(
    videos.map((video) => [video.filePath, buildSourceSnapshotSignature(video)]),
  );
  const changeSummary = computeChangeSummary(state.sourceSnapshotByVideoPath, nextSnapshot);

  state.sourceSnapshotByVideoPath = nextSnapshot;

  return changeSummary;
};

const updateOutputSnapshotChangeSummary = (
  webContentsId: number,
  clips: ExistingExportClip[],
): WatcherChangeSummary => {
  const state = getOrCreateWatcherState(webContentsId);
  const nextSnapshot = new Map<string, string>(
    clips.map((clip) => [clip.filePath, buildOutputSnapshotSignature(clip)]),
  );
  const changeSummary = computeChangeSummary(state.outputSnapshotByClipPath, nextSnapshot);

  state.outputSnapshotByClipPath = nextSnapshot;

  return changeSummary;
};

const clearWatcherState = (webContentsId: number): void => {
  watcherStateByWebContentsId.delete(webContentsId);
};

export {
  clearWatcherState,
  nextOutputSnapshotRevision,
  nextSourceSnapshotRevision,
  updateOutputSnapshotChangeSummary,
  updateSourceSnapshotChangeSummary,
};
