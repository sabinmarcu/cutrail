// @ts-check

import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';

/** @typedef {'minimize' | 'maximize' | 'close'} WindowControlAction */

/** @returns {void} */
const registerWindowControlsHandler = () => {
  /**
   * @param {import('electron').IpcMainInvokeEvent} event
   * @param {WindowControlAction} action
   * @returns {Promise<boolean | null>}
   */
  ipcMain.handle('cutrail:window-control', async (event, action) => {
    assertTrustedSender(event);

    const window = BrowserWindow.fromWebContents(event.sender);

    if (!window) {
      return null;
    }

    if (action === 'minimize') {
      window.minimize();
      return false;
    }

    if (action === 'maximize') {
      if (window.isMaximized()) {
        window.unmaximize();
        return false;
      }

      window.maximize();
      return true;
    }

    if (action === 'close') {
      window.close();
      return true;
    }

    throw new TypeError(`Unsupported window control action: ${String(action)}`);
  });
};

export {
  registerWindowControlsHandler,
};
