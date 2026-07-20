import {
  atom,
  useAtom,
} from 'jotai';

type WatcherSnapshotState = {
  sourceRevision: number;
  outputRevision: number;
};

const watcherSnapshotStateAtom = atom<WatcherSnapshotState>({
  sourceRevision: -1,
  outputRevision: -1,
});

export const useWatcherSnapshotState = () => {
  const [snapshotState, setSnapshotState] = useAtom(watcherSnapshotStateAtom);

  const acceptSourceRevision = (revision: number): boolean => {
    if (!Number.isInteger(revision) || revision <= snapshotState.sourceRevision) {
      return false;
    }

    setSnapshotState((previous) => ({
      ...previous,
      sourceRevision: revision,
    }));

    return true;
  };

  const acceptOutputRevision = (revision: number): boolean => {
    if (!Number.isInteger(revision) || revision <= snapshotState.outputRevision) {
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
