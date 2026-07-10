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
  getPersistedHideDefaultAudioTrackWhenMultiple: () => Promise<boolean>;
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
  setPersistedHideDefaultAudioTrackWhenMultiple: (value: boolean) => Promise<void>;
  setPersistedStartupWindowMode: (startupWindowMode: 'splash' | 'library') => Promise<void>;
};

const registerIpcHandlers = ({
  getAppMetadata,
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
  getPersistedHideDefaultAudioTrackWhenMultiple,
  getPersistedStartupWindowMode,
  getUpdateDialogState,
  openLibraryWindow,
  openEditorWindow,
  readThirdPartyNotices,
  submitUpdateDialogAction,
  setPersistedOutputDirectory,
  setPersistedSourceDirectory,
  setPersistedHideDefaultAudioTrackWhenMultiple,
  setPersistedStartupWindowMode,
}: RegisterIpcDeps): void => {
  registerHandlers({
    getAppMetadata,
    getPersistedOutputDirectory,
    getPersistedSourceDirectory,
    getPersistedHideDefaultAudioTrackWhenMultiple,
    getPersistedStartupWindowMode,
    getUpdateDialogState,
    openLibraryWindow,
    openEditorWindow,
    readThirdPartyNotices,
    selectValidSourceVideo,
    submitUpdateDialogAction,
    setPersistedOutputDirectory,
    setPersistedSourceDirectory,
    setPersistedHideDefaultAudioTrackWhenMultiple,
    setPersistedStartupWindowMode,
  });
};

export {
  registerIpcHandlers,
};
