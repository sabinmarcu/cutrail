import {
  atom,
  useAtom,
} from 'jotai';

type WatcherSnapshotState = {
  sourceRevision: number;
  outputRevision: number;
};

export const isWatcherRevisionAccepted = (
  previousRevision: number,
  nextRevision: number,
): boolean => Number.isInteger(nextRevision) && nextRevision > previousRevision;

const watcherSnapshotStateAtom = atom<WatcherSnapshotState>({
  sourceRevision: -1,
  outputRevision: -1,
});

export const useWatcherSnapshotState = () => {
  const [snapshotState, setSnapshotState] = useAtom(watcherSnapshotStateAtom);

  const acceptSourceRevision = (revision: number): boolean => {
    if (!isWatcherRevisionAccepted(snapshotState.sourceRevision, revision)) {
      return false;
    }

    setSnapshotState((previous) => ({
      ...previous,
      sourceRevision: revision,
    }));

    return true;
  };

  const acceptOutputRevision = (revision: number): boolean => {
    if (!isWatcherRevisionAccepted(snapshotState.outputRevision, revision)) {
      return false;
    }

    setSnapshotState((previous) => ({
      ...previous,
      outputRevision: revision,
    }));

    return true;
  };

  return {
    snapshotState,
    acceptSourceRevision,
    acceptOutputRevision,
  };
};
