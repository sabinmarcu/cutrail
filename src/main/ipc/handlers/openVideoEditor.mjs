// @ts-check

import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{
 *   openEditorWindow: (sourcePath: string) => boolean,
 *   selectValidSourceVideo: (parentWindow: BrowserWindow | null) => Promise<string | null>
 * }} deps
 * @returns {void}
 */
const registerOpenVideoEditorHandler = ({ openEditorWindow, selectValidSourceVideo }) => {
  ipcMain.handle('cutrail:open-video-editor', async (event) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const selectedPath = await selectValidSourceVideo(parentWindow);

    if (!selectedPath) {
      return null;
    }

    openEditorWindow(selectedPath);

    return selectedPath;
  });
};

export {
  registerOpenVideoEditorHandler,
};
