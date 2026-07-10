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
  getPersistedSourceDirectory: () => Promise<string | null>;
  getPersistedStartupWindowMode: () => Promise<'splash' | 'library'>;
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
  openLibraryWindow: () => boolean;
  openEditorWindow: (sourcePath: string) => boolean;
  readThirdPartyNotices: () => Promise<string>;
  submitUpdateDialogAction: (
    senderWindow: BrowserWindow | null,
    action: string,
  ) => boolean;
  setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>;
  setPersistedSourceDirectory: (sourceDirectory: string) => Promise<void>;
  setPersistedStartupWindowMode: (startupWindowMode: 'splash' | 'library') => Promise<void>;
};

const registerIpcHandlers = ({
  getAppMetadata,
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
  getPersistedStartupWindowMode,
  getUpdateDialogState,
  openLibraryWindow,
  openEditorWindow,
  readThirdPartyNotices,
  submitUpdateDialogAction,
  setPersistedOutputDirectory,
  setPersistedSourceDirectory,
  setPersistedStartupWindowMode,
}: RegisterIpcDeps): void => {
  registerHandlers({
    getAppMetadata,
    getPersistedOutputDirectory,
    getPersistedSourceDirectory,
    getPersistedStartupWindowMode,
    getUpdateDialogState,
    openLibraryWindow,
    openEditorWindow,
    readThirdPartyNotices,
    selectValidSourceVideo,
    submitUpdateDialogAction,
    setPersistedOutputDirectory,
    setPersistedSourceDirectory,
    setPersistedStartupWindowMode,
  });
};

export {
  registerIpcHandlers,
};
