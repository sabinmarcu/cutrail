// @ts-check

import {
  BrowserWindow,
  dialog,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import { validateSourceVideoFile } from '../../sourceSelection.mjs';

/**
 * @param {{
 *   openEditorWindow: (sourcePath: string) => boolean,
 *   selectValidSourceVideo: (parentWindow: BrowserWindow | null) => Promise<string | null>
 * }} deps
 * @returns {void}
 */
const registerOpenVideoEditorHandler = ({ openEditorWindow, selectValidSourceVideo }) => {
  ipcMain.handle('cutrail:open-video-editor', async (event, payload) => {
    assertTrustedSender(event);
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const payloadSourcePath = typeof nextPayload.sourcePath === 'string' ? nextPayload.sourcePath.trim() : '';

    if (payloadSourcePath.length > 0) {
      const validation = await validateSourceVideoFile(payloadSourcePath);

      if (validation.valid === false) {
        await dialog.showMessageBox(parentWindow, {
          type: 'error',
          title: 'Invalid Source Video',
          message: 'The dropped source video cannot be loaded.',
          detail: `${validation.message}\n\nPath: ${payloadSourcePath}`,
        });

        return null;
      }

      openEditorWindow(payloadSourcePath);

      return payloadSourcePath;
    }

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
