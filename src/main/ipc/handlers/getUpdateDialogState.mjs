// @ts-check

import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{
 *   getUpdateDialogState: (senderWindow: BrowserWindow | null) => unknown
 * }} deps
 * @returns {void}
 */
const registerGetUpdateDialogStateHandler = ({ getUpdateDialogState }) => {
  ipcMain.handle('cutrail:get-update-dialog-state', async (event) => {
    assertTrustedSender(event);

    return getUpdateDialogState(BrowserWindow.fromWebContents(event.sender));
  });
};

export {
  registerGetUpdateDialogStateHandler,
};
