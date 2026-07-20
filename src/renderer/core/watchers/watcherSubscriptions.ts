import { useEffect } from 'react';
import type {
  OutputDirectorySnapshotPayload,
  SourceDirectorySnapshotPayload,
} from '../../../shared/contracts.ts';
import { useWatcherSnapshotState } from './watcherState';

export const useWatcherSubscriptions = ({
  onOutputSnapshot,
  onSourceSnapshot,
}: {
  onOutputSnapshot?: (payload: OutputDirectorySnapshotPayload) => void;
  onSourceSnapshot?: (payload: SourceDirectorySnapshotPayload) => void;
} = {}): void => {
  const {
    acceptOutputRevision,
    acceptSourceRevision,
  } = useWatcherSnapshotState();

  useEffect(() => {
    if (
      typeof onSourceSnapshot !== 'function'
      || typeof globalThis.cutrail?.onSourceDirectorySnapshotUpdated !== 'function'
    ) {
      return undefined;
    }

    return globalThis.cutrail.onSourceDirectorySnapshotUpdated((payload) => {
      if (!payload || payload.watcherType !== 'source') {
        return;
      }

      if (!acceptSourceRevision(payload.snapshotRevision)) {
        return;
      }

      onSourceSnapshot(payload);
    });
  }, [acceptSourceRevision, onSourceSnapshot]);

  useEffect(() => {
    if (
      typeof onOutputSnapshot !== 'function'
      || typeof globalThis.cutrail?.onOutputDirectorySnapshotUpdated !== 'function'
    ) {
      return undefined;
    }

    return globalThis.cutrail.onOutputDirectorySnapshotUpdated((payload) => {
      if (!payload || payload.watcherType !== 'output') {
        return;
      }

      if (!acceptOutputRevision(payload.snapshotRevision)) {
        return;
      }

      onOutputSnapshot(payload);
    });
  }, [acceptOutputRevision, onOutputSnapshot]);
};
