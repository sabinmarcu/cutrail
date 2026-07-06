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
import { readThirdPartyNotices } from './notices.mjs';
import {
  APP_ICON_PATH,
  PRELOAD_ENTRY,
  RENDERER_ENTRY,
} from './paths.mjs';
import {
  getPersistedOutputDirectory,
  setPersistedOutputDirectory,
} from './settings.mjs';
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

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(APP_ICON_PATH);
  }

  registerMediaProtocol();
  registerIpcHandlers({
    getPersistedOutputDirectory,
    openEditorWindow: windows.openEditorWindow,
    readThirdPartyNotices,
    setPersistedOutputDirectory,
  });
  createAppMenu({
    openAboutWindow: windows.openAboutWindow,
    openDiagnosticsWindow: windows.openDiagnosticsWindow,
    openEditorWindow: windows.openEditorWindow,
    openLicensesWindow: windows.openLicensesWindow,
    openOptionsWindow: windows.openOptionsWindow,
    selectSourceVideo: () => selectValidSourceVideo(null),
  });
  windows.createMainWindow();

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
