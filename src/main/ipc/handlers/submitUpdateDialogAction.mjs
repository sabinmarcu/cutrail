// @ts-check

import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/**
 * @param {{
 *   submitUpdateDialogAction: (senderWindow: BrowserWindow | null, action: string) => boolean
 * }} deps
 * @returns {void}
 */
const registerSubmitUpdateDialogActionHandler = ({ submitUpdateDialogAction }) => {
  ipcMain.handle('cutrail:submit-update-dialog-action', async (event, action) => {
    assertTrustedSender(event);

    if (typeof action !== 'string') {
      throw new TypeError('update dialog action must be a string');
    }

    return submitUpdateDialogAction(BrowserWindow.fromWebContents(event.sender), action);
  });
};

export {
  registerSubmitUpdateDialogActionHandler,
};
