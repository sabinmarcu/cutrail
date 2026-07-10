import type { BrowserWindow } from 'electron';
import { registerHandlers } from './ipc/registerHandlers.ts';
import { selectValidSourceVideo } from './sourceSelection.ts';

type RegisterIpcDeps = {
  getAppMetadata: () => Promise<{
    version: string;
    copyright: string;
    attribution: string;
    license: string;
  }>;
  getPersistedOutputDirectory: () => Promise<string | null>;
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
  openEditorWindow: (sourcePath: string) => boolean;
  readThirdPartyNotices: () => Promise<string>;
  submitUpdateDialogAction: (
    senderWindow: BrowserWindow | null,
    action: string,
  ) => boolean;
  setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>;
};

const registerIpcHandlers = ({
  getAppMetadata,
  getPersistedOutputDirectory,
  getUpdateDialogState,
  openEditorWindow,
  readThirdPartyNotices,
  submitUpdateDialogAction,
  setPersistedOutputDirectory,
}: RegisterIpcDeps): void => {
  registerHandlers({
    getAppMetadata,
    getPersistedOutputDirectory,
    getUpdateDialogState,
    openEditorWindow,
    readThirdPartyNotices,
    selectValidSourceVideo,
    submitUpdateDialogAction,
    setPersistedOutputDirectory,
  });
};

export {
  registerIpcHandlers,
};
