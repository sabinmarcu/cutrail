import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

/** @typedef {'minimize' | 'maximize' | 'close'} WindowControlAction */

/** @returns {void} */
const registerWindowControlsHandler = () => {
  const initializedWindows = new WeakSet<BrowserWindow>();

  /**
   * @param {BrowserWindow} window
   * @returns {void}
   */
  const ensureFullscreenEvents = (window: BrowserWindow) => {
    if (initializedWindows.has(window)) {
      return;
    }

    const sendState = () => {
      if (!window.isDestroyed()) {
        window.webContents.send('cutrail:window-fullscreen-state-updated', window.isFullScreen());
      }
    };

    window.on('enter-full-screen', sendState);
    window.on('leave-full-screen', sendState);
    window.on('closed', () => {
      initializedWindows.delete(window);
    });
    initializedWindows.add(window);
  };

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

    ensureFullscreenEvents(window);

    if (action === 'minimize') {
      window.minimize();
      return false;
    }

    if (action === 'maximize') {
      const nextFullscreenState = !window.isFullScreen();

      window.setFullScreen(nextFullscreenState);
      return nextFullscreenState;
    }

    if (action === 'close') {
      window.close();
      return true;
    }

    throw new TypeError(`Unsupported window control action: ${String(action)}`);
  });

  ipcMain.handle('cutrail:get-window-fullscreen-state', async (event) => {
    assertTrustedSender(event);
    const window = BrowserWindow.fromWebContents(event.sender);

    if (!window) {
      return false;
    }

    ensureFullscreenEvents(window);

    return window.isFullScreen();
  });
};

export {
  registerWindowControlsHandler,
};
