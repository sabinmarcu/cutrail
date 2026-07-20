import type { BrowserWindow } from 'electron';
import { registerHandlers } from './ipc/registerHandlers.ts';
import { selectValidSourceVideo } from './sourceSelection.ts';
import type { WindowDecorationMenuPreferenceState } from '../shared/contracts.ts';
import type { WindowMenuModel } from '../shared/windowMenu.ts';
import type { ThemePrimaryColorValue } from '../shared/themePrimaryColor.ts';

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
  getPersistedDefaultTrimMode: () => Promise<'fast' | 'accurate'>;
  getPersistedThemePrimaryColor: () => Promise<ThemePrimaryColorValue>;
  getPersistedStartupWindowMode: () => Promise<'splash' | 'library'>;
  getWindowDecorationMenuPreference: () => Promise<WindowDecorationMenuPreferenceState>;
  getWindowMenuModel: () => WindowMenuModel;
  invokeWindowMenuAction: (
    actionId: string,
    senderWindow: BrowserWindow | null,
  ) => Promise<boolean>;
  getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown;
  openAboutWindow: () => Promise<boolean> | boolean;
  openDiagnosticsWindow: () => boolean;
  openLibraryWindow: () => boolean;
  openLicensesWindow: () => boolean;
  openOptionsWindow: () => boolean;
  openEditorWindow: (sourcePath: string) => boolean;
  readThirdPartyNotices: () => Promise<string>;
  submitUpdateDialogAction: (
    senderWindow: BrowserWindow | null,
    action: string,
  ) => boolean;
  setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>;
  setPersistedSourceDirectory: (sourceDirectory: string) => Promise<void>;
  setPersistedHideDefaultAudioTrackWhenMultiple: (value: boolean) => Promise<void>;
  setPersistedDefaultTrimMode: (value: 'fast' | 'accurate') => Promise<void>;
  setPersistedThemePrimaryColor: (value: ThemePrimaryColorValue) => Promise<void>;
  setPersistedStartupWindowMode: (startupWindowMode: 'splash' | 'library') => Promise<void>;
  setWindowDecorationMenuPreference: (
    enabled: boolean,
  ) => Promise<WindowDecorationMenuPreferenceState>;
};

const registerIpcHandlers = ({
  getAppMetadata,
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
  getPersistedHideDefaultAudioTrackWhenMultiple,
  getPersistedDefaultTrimMode,
  getPersistedThemePrimaryColor,
  getPersistedStartupWindowMode,
  getWindowDecorationMenuPreference,
  getWindowMenuModel,
  invokeWindowMenuAction,
  getUpdateDialogState,
  openAboutWindow,
  openDiagnosticsWindow,
  openLibraryWindow,
  openLicensesWindow,
  openOptionsWindow,
  openEditorWindow,
  readThirdPartyNotices,
  submitUpdateDialogAction,
  setPersistedOutputDirectory,
  setPersistedSourceDirectory,
  setPersistedHideDefaultAudioTrackWhenMultiple,
  setPersistedDefaultTrimMode,
  setPersistedThemePrimaryColor,
  setPersistedStartupWindowMode,
  setWindowDecorationMenuPreference,
}: RegisterIpcDeps): void => {
  registerHandlers({
    getAppMetadata,
    getPersistedOutputDirectory,
    getPersistedSourceDirectory,
    getPersistedHideDefaultAudioTrackWhenMultiple,
    getPersistedDefaultTrimMode,
    getPersistedThemePrimaryColor,
    getPersistedStartupWindowMode,
    getWindowDecorationMenuPreference,
    getWindowMenuModel,
    invokeWindowMenuAction,
    getUpdateDialogState,
    openAboutWindow,
    openDiagnosticsWindow,
    openLibraryWindow,
    openLicensesWindow,
    openOptionsWindow,
    openEditorWindow,
    readThirdPartyNotices,
    selectValidSourceVideo,
    submitUpdateDialogAction,
    setPersistedOutputDirectory,
    setPersistedSourceDirectory,
    setPersistedHideDefaultAudioTrackWhenMultiple,
    setPersistedDefaultTrimMode,
    setPersistedThemePrimaryColor,
    setPersistedStartupWindowMode,
    setWindowDecorationMenuPreference,
  });
};

export {
  registerIpcHandlers,
};
