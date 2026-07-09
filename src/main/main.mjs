// @ts-check

import { app } from 'electron';
import { registerIpcHandlers } from './ipc.mjs';
import { getRuntimeConfig } from './config/runtimeConfig.mjs';
import { selectValidSourceVideo } from './sourceSelection.mjs';
import {
  registerMediaProtocol,
  registerMediaSchemes,
} from './mediaProtocol.mjs';
import { createAppMenu } from './menu.mjs';
import { getAppMetadata } from './appMetadata.mjs';
import { readThirdPartyNotices } from './notices.mjs';
import {
  APP_ICON_PATH,
  PRELOAD_ENTRY,
  RENDERER_ENTRY,
} from './paths.mjs';
import {
  getStandaloneMenuAction,
  installStandaloneAppImage,
  uninstallStandaloneAppImage,
} from './linuxStandaloneInstall.mjs';
import {
  getPersistedOutputDirectory,
  setPersistedOutputDirectory,
} from './settings.mjs';
import { createAppUpdater } from './updater.mjs';
import { createWindowManager } from './windows/windowManager.mjs';

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
const updaterUnavailableReason = updater
  .getDisableReason()
  ?.replace(/\.$/, '') ?? 'Unavailable in this build';

app.whenReady().then(async () => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(APP_ICON_PATH);
  }

  const syncAppMenu = async () => {
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
      openLicensesWindow: windows.openLicensesWindow,
      openOptionsWindow: windows.openOptionsWindow,
      selectSourceVideo: () => selectValidSourceVideo(null),
      updateCheckLabel: updater.isEnabled
        ? 'Check for Updates...'
        : `Check for Updates (${updaterUnavailableReason})`,
    });
  };

  registerMediaProtocol();
  registerIpcHandlers({
    getAppMetadata,
    getPersistedOutputDirectory,
    getUpdateDialogState: windows.getUpdateDialogState,
    openEditorWindow: windows.openEditorWindow,
    readThirdPartyNotices,
    submitUpdateDialogAction: windows.submitUpdateDialogAction,
    setPersistedOutputDirectory,
  });
  await syncAppMenu();
  windows.createMainWindow();
  void updater.checkForUpdates();

  app.on('activate', () => {
    if (windows.getWindowCount() === 0) {
      windows.createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
