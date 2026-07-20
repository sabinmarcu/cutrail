import {
  atom,
  useAtomValue,
  useSetAtom,
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
  const snapshotState = useAtomValue(watcherSnapshotStateAtom);
  const setSnapshotState = useSetAtom(watcherSnapshotStateAtom);

  const acceptSourceRevision = (revision: number): boolean => {
    let accepted = false;

    setSnapshotState((previous) => {
      if (!isWatcherRevisionAccepted(previous.sourceRevision, revision)) {
        return previous;
      }

      accepted = true;

      return {
        ...previous,
        sourceRevision: revision,
      };
    });

    return accepted;
  };

  const acceptOutputRevision = (revision: number): boolean => {
    let accepted = false;

    setSnapshotState((previous) => {
      if (!isWatcherRevisionAccepted(previous.outputRevision, revision)) {
        return previous;
      }

      accepted = true;

      return {
        ...previous,
        outputRevision: revision,
      };
    });

    return accepted;
  };

  return {
    snapshotState,
    acceptSourceRevision,
    acceptOutputRevision,
  };
};
