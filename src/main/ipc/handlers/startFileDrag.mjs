// @ts-check

import {
  nativeImage,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.mjs';
import { APP_ICON_PATH } from '../../paths.mjs';
import { getCachedDragThumbnail } from '../../thumbnail/dragThumbnailCache.js';

/** @returns {void} */
const registerStartFileDragHandler = () => {
  ipcMain.on('cutrail:start-file-drag', async (event, payload) => {
    assertTrustedSender(event);

    const nextPayload = typeof payload === 'object' && payload !== null ? payload : {};
    const filePath = typeof nextPayload.filePath === 'string' ? nextPayload.filePath.trim() : '';

    if (!event.sender || filePath.length === 0) {
      return;
    }

    const cachedIcon = getCachedDragThumbnail(filePath);
    const icon = cachedIcon ?? nativeImage.createFromPath(APP_ICON_PATH);

    if (icon.isEmpty()) {
      return;
    }

    event.sender.startDrag({
      file: filePath,
      icon,
    });
  });
};

export {
  registerStartFileDragHandler,
};
