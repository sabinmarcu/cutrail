import type { WebContents } from 'electron';
import type { ExistingExportClip } from '../../shared/contracts.ts';
import {
  emitOutputDirectorySnapshot,
  emitWatcherHealth,
} from './watcherEmitter.ts';
import {
  nextOutputSnapshotRevision,
  updateOutputSnapshotChangeSummary,
} from './watcherRegistry.ts';

const emitOutputDirectorySnapshotUpdate = ({
  sender,
  sourcePath,
  outputDirectory,
  clips,
}: {
  sender: WebContents;
  sourcePath: string;
  outputDirectory: string;
  clips: ExistingExportClip[];
}): void => {
  const snapshotRevision = nextOutputSnapshotRevision(sender.id);
  const changeSummary = updateOutputSnapshotChangeSummary(sender.id, clips);

  emitOutputDirectorySnapshot(sender, {
    watcherType: 'output',
    snapshotRevision,
    sourcePath,
    outputDirectory,
    generatedAtMs: Date.now(),
    clips: clips.map((clip) => ({
      ...clip,
      metadataPresence: clip.metadataPresence ?? 'legacy',
      classificationKind: clip.classificationKind ?? 'legacy',
      identityKeys: clip.identityKeys ?? {
        clipId: null,
        planId: null,
        sourceFingerprint: null,
        variantKey: null,
        rangeKey: null,
      },
      selectedAudioTrackIndices: clip.selectedAudioTrackIndices ?? [],
      mutedAudioTrackIndices: clip.mutedAudioTrackIndices ?? [],
    })),
    changeSummary,
  });

  emitWatcherHealth(sender, {
    watcherType: 'output',
    state: 'active',
    reason: 'watcher-snapshot-emitted',
    generatedAtMs: Date.now(),
  });
};

const emitOutputDirectoryWatcherDegraded = ({
  sender,
  reason,
}: {
  sender: WebContents;
  reason: string;
}): void => {
  emitWatcherHealth(sender, {
    watcherType: 'output',
    state: 'degraded',
    reason,
    generatedAtMs: Date.now(),
  });
};

const emitOutputDirectoryWatcherStopped = ({
  sender,
  reason,
}: {
  sender: WebContents;
  reason: string;
}): void => {
  emitWatcherHealth(sender, {
    watcherType: 'output',
    state: 'stopped',
    reason,
    generatedAtMs: Date.now(),
  });
};

export {
  emitOutputDirectorySnapshotUpdate,
  emitOutputDirectoryWatcherDegraded,
  emitOutputDirectoryWatcherStopped,
};
