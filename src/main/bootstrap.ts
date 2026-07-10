import { app } from 'electron';

import { registerIpcHandlers } from './ipc.ts';
import { getRuntimeConfig } from './config/runtimeConfig.ts';
import { selectValidSourceVideo } from './sourceSelection.ts';
import {
  registerMediaProtocol,
  registerMediaSchemes,
} from './mediaProtocol.ts';
import { createAppMenu } from './menu.ts';
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
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
  getPersistedStartupWindowMode,
  setPersistedSourceDirectory,
  setPersistedOutputDirectory,
  setPersistedStartupWindowMode,
} from './settings.ts';
import { createAppUpdater } from './updater.ts';
import { createWindowManager } from './windows/windowManager.ts';

registerMediaSchemes();

const runtimeConfig = getRuntimeConfig();
const windows = createWindowManager({
  appIconPath: APP_ICON_PATH,
  devServerUrl: runtimeConfig.devServerUrl,
  openDevToolsOnStart: runtimeConfig.openDevToolsOnStart,
  preloadEntry: PRELOAD_ENTRY,
  rendererEntry: RENDERER_ENTRY,
});
const updater = createAppUpdater({
  openUpdateDialog: windows.openUpdateDialog,
  updateUpdateDialogState: windows.updateUpdateDialogState,
});
const updaterUnavailableReason = updater.getDisableReason()?.replace(/\.$/, '') ?? 'Unavailable in this build';

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
    await ensurePersistedDirectories();
    registerIpcHandlers({
      getAppMetadata,
      getPersistedOutputDirectory,
      getPersistedSourceDirectory,
      getPersistedStartupWindowMode,
      getUpdateDialogState: windows.getUpdateDialogState,
      openLibraryWindow: windows.openLibraryWindow,
      openEditorWindow: windows.openEditorWindow,
      readThirdPartyNotices,
      submitUpdateDialogAction: windows.submitUpdateDialogAction,
      setPersistedOutputDirectory,
      setPersistedSourceDirectory,
      setPersistedStartupWindowMode,
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
