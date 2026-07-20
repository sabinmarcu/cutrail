import type { WebContents } from 'electron';
import {
  outputDirectorySnapshotSchema,
  sourceDirectorySnapshotSchema,
  watcherHealthSchema,
  WATCHER_CHANNELS,
  type OutputDirectorySnapshotPayload,
  type SourceDirectorySnapshotPayload,
  type WatcherHealthPayload,
} from '../../shared/watcherEvents.ts';

const sendToWatcherChannel = <TPayload>(
  sender: WebContents,
  channel: string,
  payload: TPayload,
): void => {
  if (sender.isDestroyed()) {
    return;
  }

  sender.send(channel, payload);
};

const emitSourceDirectorySnapshot = (
  sender: WebContents,
  payload: SourceDirectorySnapshotPayload,
): void => {
  const parsedPayload = sourceDirectorySnapshotSchema.parse(payload);

  sendToWatcherChannel(sender, WATCHER_CHANNELS.sourceSnapshotUpdated, parsedPayload);
};

const emitOutputDirectorySnapshot = (
  sender: WebContents,
  payload: OutputDirectorySnapshotPayload,
): void => {
  const parsedPayload = outputDirectorySnapshotSchema.parse(payload);

  sendToWatcherChannel(sender, WATCHER_CHANNELS.outputSnapshotUpdated, parsedPayload);
};

const emitWatcherHealth = (
  sender: WebContents,
  payload: WatcherHealthPayload,
): void => {
  const parsedPayload = watcherHealthSchema.parse(payload);

  sendToWatcherChannel(sender, WATCHER_CHANNELS.watcherHealthUpdated, parsedPayload);
};

export {
  emitOutputDirectorySnapshot,
  emitSourceDirectorySnapshot,
  emitWatcherHealth,
};
