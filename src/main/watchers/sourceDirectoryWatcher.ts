import type { WebContents } from 'electron';
import {
  emitSourceDirectorySnapshot,
  emitWatcherHealth,
} from './watcherEmitter.ts';
import {
  nextSourceSnapshotRevision,
  updateSourceSnapshotChangeSummary,
} from './watcherRegistry.ts';
import type { SourceDirectoryEntry } from '../../shared/watcherEvents.ts';

const emitSourceDirectorySnapshotUpdate = ({
  sender,
  sourceDirectory,
  videos,
}: {
  sender: WebContents;
  sourceDirectory: string;
  videos: SourceDirectoryEntry[];
}): void => {
  const snapshotRevision = nextSourceSnapshotRevision(sender.id);
  const changeSummary = updateSourceSnapshotChangeSummary(sender.id, videos);

  emitSourceDirectorySnapshot(sender, {
    watcherType: 'source',
    snapshotRevision,
    sourceDirectory,
    generatedAtMs: Date.now(),
    videos,
    changeSummary,
  });

  emitWatcherHealth(sender, {
    watcherType: 'source',
    state: 'active',
    reason: 'watcher-snapshot-emitted',
    generatedAtMs: Date.now(),
  });
};

const emitSourceDirectoryWatcherDegraded = ({
  sender,
  reason,
}: {
  sender: WebContents;
  reason: string;
}): void => {
  emitWatcherHealth(sender, {
    watcherType: 'source',
    state: 'degraded',
    reason,
    generatedAtMs: Date.now(),
  });
};

const emitSourceDirectoryWatcherStopped = ({
  sender,
  reason,
}: {
  sender: WebContents;
  reason: string;
}): void => {
  emitWatcherHealth(sender, {
    watcherType: 'source',
    state: 'stopped',
    reason,
    generatedAtMs: Date.now(),
  });
};

export {
  emitSourceDirectorySnapshotUpdate,
  emitSourceDirectoryWatcherDegraded,
  emitSourceDirectoryWatcherStopped,
};
