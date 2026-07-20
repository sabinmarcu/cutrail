import { app } from 'electron';

import { getAppEnvironment } from '../infra/env.ts';
import {
  setFfmpegResolutionMode,
  setFfprobeResolutionMode,
} from '../infra/ffmpeg/ffmpegResolutionPreferences.ts';
import { registerIpcHandlers } from './ipc.ts';
import { selectValidSourceVideo } from './sourceSelection.ts';
import {
  registerMediaProtocol,
  registerMediaSchemes,
} from './mediaProtocol.ts';
import {
  createAppMenu,
  getWindowMenuModel,
  invokeWindowMenuAction,
} from './menu.ts';
import { getAppMetadata } from './appMetadata.ts';
import { readThirdPartyNotices } from './notices.ts';
import {
  APP_ICON_PATH,
  PRELOAD_ENTRY,
  RENDERER_ENTRY,
} from './paths.ts';
import {
  getStandaloneMenuAction,
  installStandaloneAppImage,
  uninstallStandaloneAppImage,
} from './linuxStandaloneInstall.ts';
import {
  ensurePersistedDirectories,
  getPersistedDefaultTrimMode,
  getPersistedFfmpegResolutionMode,
  getPersistedFfprobeResolutionMode,
  getPersistedHideDefaultAudioTrackWhenMultiple,
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
  getPersistedStartupWindowMode,
  getPersistedThemePrimaryColor,
  getPersistedWindowDecorationMenuEnabled,
  setPersistedDefaultTrimMode,
  setPersistedFfmpegResolutionMode,
  setPersistedFfprobeResolutionMode,
  setPersistedHideDefaultAudioTrackWhenMultiple,
  setPersistedOutputDirectory,
  setPersistedThemePrimaryColor,
  setPersistedWindowDecorationMenuEnabled,
  setPersistedSourceDirectory,
  setPersistedStartupWindowMode,
} from './settings.ts';
import { createAppUpdater } from './updater.ts';
import { createWindowManager } from './windows/windowManager.ts';
import { resolveWindowMenuPresentation } from './menuVisibility.ts';
import { registerFileAssociationIntegration } from './fileAssociations.ts';
import type { WindowDecorationMenuPreferenceState } from '../shared/contracts.ts';

// Allow renderer playback to use HTMLMediaElement.audioTracks when Chromium keeps it gated.
app.commandLine.appendSwitch('enable-blink-features', 'AudioVideoTracks');

registerMediaSchemes();

const environment = getAppEnvironment();
const windows = createWindowManager({
  appIconPath: APP_ICON_PATH,
  devServerUrl: environment.devServerUrl,
  forceNativeWindowDecorations: environment.forceNativeWindowDecorations,
  openDevToolsOnStart: environment.openDevToolsOnStart,
  preloadEntry: PRELOAD_ENTRY,
  rendererEntry: RENDERER_ENTRY,
});
const updater = createAppUpdater({
  openUpdateDialog: windows.openUpdateDialog,
  updateUpdateDialogState: windows.updateUpdateDialogState,
});
registerFileAssociationIntegration({
  openEditorWindow: windows.openEditorWindow,
});
const environmentMenuDefault = resolveWindowMenuPresentation(
  environment,
).useWindowDecorationMenu;
const updateDisableReason = updater.getDisableReason()?.replace(/\.$/, '');
const unavailableUpdateLabel = 'Unavailable in this build';
const updaterUnavailableReason = updateDisableReason ?? unavailableUpdateLabel;

async function resolveWindowDecorationMenuPreference() {
  const configuredEnabled = await getPersistedWindowDecorationMenuEnabled();
  const forcedByEnvironment = environment.forceWindowDecorationMenu;

  return {
    configuredEnabled,
    effectiveEnabled: forcedByEnvironment || configuredEnabled,
    forcedByEnvironment,
  };
}

const setWindowDecorationMenuPreference = async (
  enabled: boolean,
): Promise<WindowDecorationMenuPreferenceState> => {
  await setPersistedWindowDecorationMenuEnabled(enabled);

  return resolveWindowDecorationMenuPreference();
};

const openStartupWindow = async (): Promise<void> => {
  const startupWindowMode = await getPersistedStartupWindowMode();

  if (startupWindowMode === 'library') {
    windows.openLibraryWindow();

    return;
  }

  windows.createMainWindow();
};

const syncAppMenu = async (): Promise<void> => {
  const standaloneAction = await getStandaloneMenuAction();

  createAppMenu({
    checkForUpdates: () => updater.checkForUpdates({ manual: true }),
    installStandaloneAppImage: async () => {
      await installStandaloneAppImage({
        appIconPath: APP_ICON_PATH,
        openDialog: windows.openUpdateDialog,
      });
      await syncAppMenu();
    },
    standaloneAction,
    uninstallStandaloneAppImage: async () => {
      await uninstallStandaloneAppImage({
        openDialog: windows.openUpdateDialog,
      });
      await syncAppMenu();
    },
    isUpdateCheckEnabled: updater.isEnabled,
    openAboutWindow: windows.openAboutWindow,
    openDiagnosticsWindow: windows.openDiagnosticsWindow,
    openEditorWindow: windows.openEditorWindow,
    openLibraryWindow: windows.openLibraryWindow,
    openLicensesWindow: windows.openLicensesWindow,
    openOptionsWindow: windows.openOptionsWindow,
    openStartPage: windows.openStartPage,
    selectSourceVideo: () => selectValidSourceVideo(null),
    updateCheckLabel: updater.isEnabled
      ? 'Check for Updates...'
      : `Check for Updates (${updaterUnavailableReason})`,
  });
};

const startApp = async (): Promise<void> => {
  try {
    if (process.platform === 'darwin' && app.dock) {
      app.dock.setIcon(APP_ICON_PATH);
    }

    registerMediaProtocol();
    await ensurePersistedDirectories(environmentMenuDefault);
    setFfmpegResolutionMode(await getPersistedFfmpegResolutionMode());
    setFfprobeResolutionMode(await getPersistedFfprobeResolutionMode());
    registerIpcHandlers({
      getAppMetadata,
      getPersistedOutputDirectory,
      getPersistedSourceDirectory,
      getPersistedHideDefaultAudioTrackWhenMultiple,
      getPersistedDefaultTrimMode,
      getPersistedFfmpegResolutionMode,
      getPersistedFfprobeResolutionMode,
      getPersistedThemePrimaryColor,
      getPersistedStartupWindowMode,
      getWindowDecorationMenuPreference: resolveWindowDecorationMenuPreference,
      getWindowMenuModel,
      invokeWindowMenuAction,
      getUpdateDialogState: windows.getUpdateDialogState,
      openAboutWindow: windows.openAboutWindow,
      openDiagnosticsWindow: windows.openDiagnosticsWindow,
      openLibraryWindow: windows.openLibraryWindow,
      openLicensesWindow: windows.openLicensesWindow,
      openOptionsWindow: windows.openOptionsWindow,
      openEditorWindow: windows.openEditorWindow,
      readThirdPartyNotices,
      submitUpdateDialogAction: windows.submitUpdateDialogAction,
      setPersistedOutputDirectory,
      setPersistedHideDefaultAudioTrackWhenMultiple,
      setPersistedDefaultTrimMode,
      setPersistedFfmpegResolutionMode,
      setPersistedFfprobeResolutionMode,
      setPersistedThemePrimaryColor,
      setPersistedSourceDirectory,
      setPersistedStartupWindowMode,
      setWindowDecorationMenuPreference,
    });
    await syncAppMenu();
    await openStartupWindow();
    updater.checkForUpdates();

    app.on('activate', async () => {
      if (windows.getWindowCount() === 0) {
        await openStartupWindow();
      }
    });
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    app.exit(1);
  }
};

export const registerAppBootstrap = (): void => {
  app.once('ready', () => {
    startApp();
  });
};
