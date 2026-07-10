import {
  BrowserWindow,
  dialog,
  ipcMain,
} from 'electron';
import type { OpenDialogOptions } from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

type SelectSourceDirectoryDeps = {
  getPersistedOutputDirectory: () => Promise<string | null>;
  getPersistedSourceDirectory: () => Promise<string | null>;
  setPersistedSourceDirectory: (sourceDirectory: string) => Promise<void>;
};

const registerSelectSourceDirectoryHandler = ({
  getPersistedOutputDirectory,
  getPersistedSourceDirectory,
  setPersistedSourceDirectory,
}: SelectSourceDirectoryDeps): void => {
  ipcMain.handle('cutrail:select-source-directory', async (event) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const currentSourceDirectory = await getPersistedSourceDirectory();
    const previousOutputDirectory = await getPersistedOutputDirectory();
    const dialogOptions: OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: currentSourceDirectory ?? undefined,
    };
    const result = parentWindow
      ? await dialog.showOpenDialog(parentWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const selectedPath = result.filePaths[0];
    await setPersistedSourceDirectory(selectedPath);
    const nextOutputDirectory = await getPersistedOutputDirectory();

    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('cutrail:source-directory-updated', selectedPath);

      if (nextOutputDirectory && nextOutputDirectory !== previousOutputDirectory) {
        window.webContents.send('cutrail:output-directory-updated', nextOutputDirectory);
      }
    }

    return selectedPath;
  });
};

export {
  registerSelectSourceDirectoryHandler,
};
