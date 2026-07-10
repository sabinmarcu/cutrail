import {
  BrowserWindow,
  dialog,
  ipcMain,
} from 'electron';
import type { OpenDialogOptions } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SelectOutputDirectoryDeps = {
  getPersistedOutputDirectory: () => Promise<string | null>;
  setPersistedOutputDirectory: (outputDirectory: string) => Promise<void>;
};

const registerSelectOutputDirectoryHandler = ({
  getPersistedOutputDirectory,
  setPersistedOutputDirectory,
}: SelectOutputDirectoryDeps): void => {
  ipcMain.handle('cutrail:select-output-directory', async (event) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const persistedOutputDirectory = await getPersistedOutputDirectory();
    const dialogOptions: OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: persistedOutputDirectory ?? undefined,
    };
    const result = parentWindow
      ? await dialog.showOpenDialog(parentWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

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
