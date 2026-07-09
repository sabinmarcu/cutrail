// @ts-check

import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import { APP_ICON_PATH } from '../../paths.mjs';

/** @returns {void} */
const registerStartFileDragHandler = () => {
  ipcMain.handle('cutrail:start-file-drag', async (event, payload) => {
    assertTrustedSender(event);

    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const filePath = typeof nextPayload.filePath === 'string' ? nextPayload.filePath.trim() : '';

    if (!parentWindow || filePath.length === 0) {
      return false;
    }

    parentWindow.webContents.startDrag({
      file: filePath,
      icon: APP_ICON_PATH,
    });

    return true;
  });
};

export {
  registerStartFileDragHandler,
};
