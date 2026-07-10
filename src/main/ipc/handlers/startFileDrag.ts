import {
  nativeImage,
  ipcMain,
} from 'electron';
import { assertTrustedSender } from '../assertTrustedSender.ts';
import { APP_ICON_PATH } from '../../paths.ts';
import type { StartFileDragPayload } from '../../../shared/contracts.ts';
import { getCachedDragThumbnail } from '../../thumbnail/dragThumbnailCache.ts';

/** @returns {void} */
const registerStartFileDragHandler = () => {
  ipcMain.on('cutrail:start-file-drag', async (event, payload) => {
    assertTrustedSender(event);

    const nextPayload: StartFileDragPayload = typeof payload === 'object' && payload !== null
      ? payload as StartFileDragPayload
      : {};
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
