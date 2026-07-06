// @ts-check

import {
  BrowserWindow,
  dialog,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{
 *   getPersistedOutputDirectory: () => Promise<string | null>,
 *   setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>
 * }} deps
 * @returns {void}
 */
const registerSelectOutputDirectoryHandler = ({ getPersistedOutputDirectory, setPersistedOutputDirectory }) => {
  ipcMain.handle('cutrail:select-output-directory', async (event) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const persistedOutputDirectory = await getPersistedOutputDirectory();
    const result = await dialog.showOpenDialog(parentWindow, {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: persistedOutputDirectory ?? undefined,
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const selectedPath = result.filePaths[0];
    await setPersistedOutputDirectory(selectedPath);
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:output-directory-updated', selectedPath);
    }

    return selectedPath;
  });
};

export {
  registerSelectOutputDirectoryHandler,
};
