import {
  BrowserWindow,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';

/**
 * @param {{
 *   selectValidSourceVideo: (parentWindow: BrowserWindow | null) => Promise<string | null>
 * }} deps
 * @returns {void}
 */
const registerSelectSourceVideoHandler = ({
  selectValidSourceVideo,
}: {
  selectValidSourceVideo: (parentWindow: BrowserWindow | null) => Promise<string | null>;
}): void => {
  ipcMain.handle('cutrail:select-source-video', async (event) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);

    return selectValidSourceVideo(parentWindow);
  });
};

export {
  registerSelectSourceVideoHandler,
};
