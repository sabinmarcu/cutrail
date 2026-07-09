// @ts-check

import {
  clipboard,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import { revealClipPath } from './clipFileActions.reveal.mjs';

/**
 * @typedef {'copy-file' | 'copy-path' | 'show-item-in-folder' | 'open-directory' | 'open-file' | 'none'} ClipActionMethod
 */

/**
 * @typedef {{ ok: boolean, method: ClipActionMethod, error?: string }} ClipFileActionResult
 */

/** @returns {void} */
const registerClipFileActionsHandler = () => {
  ipcMain.handle('cutrail:clip-file-action', async (event, payload) => {
    assertTrustedSender(event);

    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const action = typeof nextPayload.action === 'string' ? nextPayload.action : '';
    const filePath = typeof nextPayload.filePath === 'string' ? nextPayload.filePath.trim() : '';

    if (filePath.length === 0) {
      return {
        ok: false,
        method: 'none',
        error: 'file-path-required',
      };
    }

    if (action === 'copy-file') {
      clipboard.writeBuffer('text/uri-list', Buffer.from(`file://${encodeURI(filePath)}\r\n`, 'utf8'));

      return {
        ok: true,
        method: 'copy-file',
      };
    }

    if (action === 'copy-path') {
      clipboard.writeText(filePath);

      return {
        ok: true,
        method: 'copy-path',
      };
    }

    if (action === 'reveal') {
      return revealClipPath(filePath);
    }

    return {
      ok: false,
      method: 'none',
      error: 'unsupported-action',
    };
  });
};

export {
  registerClipFileActionsHandler,
};
