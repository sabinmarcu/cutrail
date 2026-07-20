type WatcherState = {
  sourceSnapshotRevision: number;
  outputSnapshotRevision: number;
};

const watcherStateByWebContentsId = new Map<number, WatcherState>();

const getOrCreateWatcherState = (webContentsId: number): WatcherState => {
  const existing = watcherStateByWebContentsId.get(webContentsId);

  if (existing) {
    return existing;
  }

  const created: WatcherState = {
    sourceSnapshotRevision: 0,
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

const clearWatcherState = (webContentsId: number): void => {
  watcherStateByWebContentsId.delete(webContentsId);
};

export {
  clearWatcherState,
  nextOutputSnapshotRevision,
  nextSourceSnapshotRevision,
};
